import { hash, compare } from 'bcryptjs';
import getMongoClient from './db';

// Function to hash password
export async function hashPassword(password: string) {
  return await hash(password, 12);
}

// Function to verify password
export async function verifyPassword(password: string, hashedPassword: string) {
  return await compare(password, hashedPassword);
}

// Function to get user by email
export async function getUserByEmail(email: string) {
  try {
  const client = await getMongoClient();
    const db = client.db();
    return await db.collection('users').findOne({ email });
  } catch (error) {
    console.error('Error fetching user:', error);
    throw new Error('Failed to fetch user');
  }
}

// Function to create a new user
export async function createUser(name: string, email: string, password: string, role: 'CUSTOMER' | 'ARTIST') {
  try {
    const hashedPassword = await hashPassword(password);
  const client = await getMongoClient();
    const db = client.db();
    
    const result = await db.collection('users').insertOne({
      name,
      email,
      password: hashedPassword,
      role,
      createdAt: new Date(),
      updatedAt: new Date()
    });

    const user = await db.collection('users').findOne({ _id: result.insertedId });
    if (!user) throw new Error('User not found after creation');

    // Return user without password
    const { password: _, ...userWithoutPassword } = user;
    return userWithoutPassword;
  } catch (error) {
    console.error('Error creating user:', error);
    throw new Error('Failed to create user');
  }
}