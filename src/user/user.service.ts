import axios from 'axios';
import { BadRequestException, Injectable } from '@nestjs/common';
import { User } from './user.interface';

@Injectable()
export class UserService {
  private users: User[] = [];
  private idCounter = 1;

  async create(user: Omit<User, 'id'>): Promise<User> {
    await this.validateCep(user.cep);
    this.validateName(user.nome);
    this.validateEmailFormat(user.email);
    this.checkIfEmailExists(user.email);

    const newUser = { id: this.idCounter++, ...user };
    this.users.push(newUser);
    return newUser;
  }

  findAll(): User[] {
    return this.users;
  }

  findOne(id: number): User | undefined {
    return this.users.find((user) => user.id === id);
  }
  findByEmail(email: string): User | undefined {
    return this.users.find((user) => user.email === email);
  }

  async update(email: string, userPayload: Omit<User, 'id'>): Promise<User> {
    const matchedUser = this.findByEmail(userPayload.email);

    if (!matchedUser) {
      throw new BadRequestException('Usuário não encontrado');
    }

    await this.validateCep(userPayload.cep);
    this.validateName(userPayload.nome);
    this.validateEmailFormat(userPayload.email);

    if (userPayload.email !== matchedUser.email) {
      this.checkIfEmailExists(userPayload.email);
    }

    const updatedUser = { ...matchedUser, ...userPayload };

    const index = this.users.findIndex((user) => user.email === matchedUser.email);
    if (index !== -1) {
      this.users[index] = updatedUser;
    } else {
      throw new BadRequestException('Erro ao atualizar o usuário');
    }

    return this.users[index];
  }

  delete(email: string): boolean {
    const index = this.users.findIndex((user) => user.email === email);
    if (index !== -1) {
      this.users.splice(index, 1);
      return true;
    }
    return false;
  }

  private validateName(name: string): void {
    const checkNameRegex = /^[a-zA-Z\s]+$/;
    if (!checkNameRegex.test(name)) {
      throw new BadRequestException(
        'O nome não pode conter números e precisa ser informado corretamente.',
      );
    }
  }

  private validateEmailFormat(email: string): void {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      throw new BadRequestException('O formato do email é inválido.');
    }
  }

  private checkIfEmailExists(email: string): void {
    const existingUser = this.users.find((user) => user.email === email);
    if (existingUser) {
      throw new BadRequestException('O email já está cadastrado.');
    }
  }

  private async validateCep(cep: string): Promise<void> {
    const cepRegex = /^\d+$/;

    if (!cepRegex.test(cep)) {
      throw new BadRequestException(`O CEP "${cep}" deve conter apenas números.`);
    }

    try {
      const response = await axios.get(`https://brasilapi.com.br/api/cep/v1/${cep}`);

      if (!response.data || response.data.cep !== cep) {
        throw new Error('CEP inválido');
      }
    } catch (error) {
      throw new BadRequestException(`Erro ao validar o CEP "${cep}": ${error.message}`);
    }
  }
}
