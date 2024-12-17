import { Test, TestingModule } from '@nestjs/testing';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';
import axios from 'axios';

// Mockando axios
jest.mock('axios');

describe('UserService', () => {
  let service: UserService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [UserService],
    }).compile();

    service = module.get<UserService>(UserService);
  });

  afterEach(() => {
    jest.clearAllMocks();
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  describe('create', () => {
    it('should create a new user successfully', async () => {
      const user = { nome: 'John Doe', email: 'john.doe@example.com', cep: '12345678' };
      axios.get = jest.fn().mockResolvedValue({ data: { cep: '12345678' } });

      const createdUser = await service.create(user);

      expect(createdUser).toHaveProperty('id');
      expect(createdUser.nome).toBe(user.nome);
      expect(createdUser.email).toBe(user.email);
    });

    it('should throw BadRequestException if name is invalid', async () => {
      const user = { nome: 'John123', email: 'john.doe@example.com', cep: '12345678' };
      await expect(service.create(user)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email format is invalid', async () => {
      const user = { nome: 'John Doe', email: 'invalid-email', cep: '12345678' };
      await expect(service.create(user)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if email already exists', async () => {
      const user = { nome: 'John Doe', email: 'john.doe@example.com', cep: '12345678' };
      await service.create(user); // Cria o primeiro usuário
      await expect(service.create(user)).rejects.toThrow(BadRequestException);
    });

    it('should throw BadRequestException if cep is invalid', async () => {
      const user = { nome: 'John Doe', email: 'john.doe@example.com', cep: 'invalid-cep' };
      await expect(service.create(user)).rejects.toThrow(BadRequestException);
    });
  });

  describe('findAll', () => {
    it('should return an array of users', () => {
      const user1 = { nome: 'John Doe', email: 'john.doe@example.com', cep: '12345678' };
      const user2 = { nome: 'Jane Doe', email: 'jane.doe@example.com', cep: '87654321' };
      service.create(user1);
      service.create(user2);

      const users = service.findAll();
      expect(users).toHaveLength(2);
    });
  });

  describe('findOne', () => {
    it('should return the user with the given id', async () => {
      const user = { nome: 'John Doe', email: 'john.doe@example.com', cep: '12345678' };
      const createdUser = await service.create(user);
      const foundUser = service.findOne(createdUser.id);

      expect(foundUser).toEqual(createdUser);
    });

    it('should return undefined if no user is found with the given id', () => {
      const foundUser = service.findOne(99);
      expect(foundUser).toBeUndefined();
    });
  });

  describe('update', () => {
    it('should update the user successfully', async () => {
      const user = { nome: 'John Doe', email: 'john.doe@example.com', cep: '12345678' };
      const updatedUserPayload = { nome: 'John Doe Updated', email: 'john.doe@example.com', cep: '87654321' };

      axios.get = jest.fn().mockResolvedValue({ data: { cep: '87654321' } });

      const createdUser = await service.create(user);
      const updatedUser = await service.update(createdUser.email, updatedUserPayload);

      expect(updatedUser.nome).toBe('John Doe Updated');
      expect(updatedUser.cep).toBe('87654321');
    });

    it('should throw BadRequestException if user is not found for update', async () => {
      const updatedUserPayload = { nome: 'John Doe Updated', email: 'john.doe@example.com', cep: '87654321' };

      await expect(service.update('non.existent@example.com', updatedUserPayload)).rejects.toThrow(BadRequestException);
    });
  });

  describe('delete', () => {
    it('should delete a user successfully', async () => {
      const user = { nome: 'John Doe', email: 'john.doe@example.com', cep: '12345678' };
      await service.create(user);
      const result = service.delete(user.email);
      expect(result).toBe(true);
    });

    it('should return false if user does not exist for deletion', () => {
      const result = service.delete('non.existent@example.com');
      expect(result).toBe(false);
    });
  });
});
