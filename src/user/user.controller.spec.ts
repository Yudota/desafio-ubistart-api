import { Test, TestingModule } from '@nestjs/testing';
import { UserController } from './user.controller';
import { UserService } from './user.service';
import { BadRequestException } from '@nestjs/common';

describe('UserController', () => {
  let userController: UserController;
  // eslint-disable-next-line @typescript-eslint/no-unused-vars
  let userService: UserService;

  const mockUserService = {
    create: jest.fn(),
    findAll: jest.fn(),
    findByEmail: jest.fn(),
    update: jest.fn(),
    delete: jest.fn(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [UserController],
      providers: [
        {
          provide: UserService,
          useValue: mockUserService,
        },
      ],
    }).compile();

    userController = module.get<UserController>(UserController);
    userService = module.get<UserService>(UserService);
  });

  describe('create', () => {
    it('deve criar um usuário com sucesso', async () => {
      const createUserDto = {
        nome: 'Test User',
        email: 'test@user.com',
        cep: '12345678',
      };
      const result = { id: 1, ...createUserDto };

      mockUserService.create.mockResolvedValue(result);

      expect(await userController.create(createUserDto)).toEqual(result);
      expect(mockUserService.create).toHaveBeenCalledWith(createUserDto);
    });
  });

  describe('findAll', () => {
    it('deve retornar todos os usuários', async () => {
      const result = [
        {
          id: 1,
          nome: 'Test User 1',
          email: 'test1@user.com',
          cep: '12345678',
        },
        {
          id: 2,
          nome: 'Test User 2',
          email: 'test2@user.com',
          cep: '23456789',
        },
      ];

      mockUserService.findAll.mockResolvedValue(result);

      expect(await userController.findAll()).toEqual(result);
      expect(mockUserService.findAll).toHaveBeenCalled();
    });
  });

  describe('edit', () => {
    it('deve editar um usuário com sucesso', async () => {
      const email = 'test@user.com';
      const editUserDto = { nome: 'Updated User' };
      const existingUser = { id: 1, nome: 'Test User', email, cep: '12345678' };

      mockUserService.findByEmail.mockReturnValue(existingUser);
      mockUserService.update.mockResolvedValue({
        ...existingUser,
        ...editUserDto,
      });

      expect(await userController.edit(email, editUserDto)).toEqual({
        ...existingUser,
        ...editUserDto,
      });
      expect(mockUserService.findByEmail).toHaveBeenCalledWith(email);
      expect(mockUserService.update).toHaveBeenCalledWith(email, {
        ...existingUser,
        ...editUserDto,
      });
    });

    it('deve lançar um erro se o usuário não for encontrado', async () => {
      const email = 'nonexistent@user.com';
      const editUserDto = { nome: 'Updated User' };

      mockUserService.findByEmail.mockReturnValue(null);

      try {
        await userController.edit(email, editUserDto);
      } catch (error) {
        expect(error).toBeInstanceOf(BadRequestException);
        expect(error.message).toBe('Usuário não encontrado');
      }
    });
  });

  describe('delete', () => {
    it('deve deletar um usuário com sucesso', async () => {
      const email = 'test@user.com';

      mockUserService.delete.mockResolvedValue(true);

      expect(await userController.delete(email)).toBe(true);
      expect(mockUserService.delete).toHaveBeenCalledWith(email);
    });

    it('deve lançar um erro se o usuário não for encontrado', async () => {
      const email = 'nonexistent@user.com';

      mockUserService.delete.mockResolvedValue(false);

      expect(await userController.delete(email)).toBe(false);
      expect(mockUserService.delete).toHaveBeenCalledWith(email);
    });
  });
});
