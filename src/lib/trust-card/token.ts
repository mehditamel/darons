import { randomBytes } from "crypto";
import bcrypt from "bcryptjs";

const PIN_LENGTH = 4;
const TOKEN_BYTES = 18;

export function generateToken(): string {
  return randomBytes(TOKEN_BYTES).toString("base64url");
}

export function generatePin(): string {
  let pin = "";
  for (let i = 0; i < PIN_LENGTH; i++) {
    pin += Math.floor(Math.random() * 10).toString();
  }
  return pin;
}

export async function hashPin(pin: string): Promise<string> {
  return bcrypt.hash(pin, 10);
}

export async function verifyPin(pin: string, hash: string): Promise<boolean> {
  return bcrypt.compare(pin, hash);
}
