import { 
  type ChatSession, 
  type InsertChatSession,
  type Message,
  type InsertMessage,
  type Attachment,
  type InsertAttachment
} from "@shared/schema";
import { randomUUID } from "crypto";

export interface IStorage {
  // Sessions
  getSessions(): Promise<ChatSession[]>;
  getSession(id: string): Promise<ChatSession | undefined>;
  createSession(session: InsertChatSession): Promise<ChatSession>;
  updateSession(id: string, data: Partial<InsertChatSession>): Promise<ChatSession | undefined>;
  deleteSession(id: string): Promise<boolean>;
  
  // Messages
  getMessages(sessionId: string): Promise<Message[]>;
  getMessage(id: string): Promise<Message | undefined>;
  createMessage(message: InsertMessage): Promise<Message>;
  deleteMessage(id: string): Promise<boolean>;

  // Attachments
  createAttachment(attachment: InsertAttachment): Promise<Attachment>;
  getAttachment(id: string): Promise<Attachment | undefined>;
}

export class MemStorage implements IStorage {
  private sessions: Map<string, ChatSession>;
  private messages: Map<string, Message>;
  private attachments: Map<string, Attachment>;

  constructor() {
    this.sessions = new Map();
    this.messages = new Map();
    this.attachments = new Map();
  }

  // Sessions
  async getSessions(): Promise<ChatSession[]> {
    return Array.from(this.sessions.values()).sort(
      (a, b) => new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime()
    );
  }

  async getSession(id: string): Promise<ChatSession | undefined> {
    return this.sessions.get(id);
  }

  async createSession(insertSession: InsertChatSession): Promise<ChatSession> {
    const id = randomUUID();
    const now = new Date();
    const session: ChatSession = {
      id,
      ...insertSession,
      createdAt: now,
      updatedAt: now,
    };
    this.sessions.set(id, session);
    return session;
  }

  async updateSession(id: string, data: Partial<InsertChatSession>): Promise<ChatSession | undefined> {
    const session = this.sessions.get(id);
    if (!session) return undefined;

    const updated: ChatSession = {
      ...session,
      ...data,
      updatedAt: new Date(),
    };
    this.sessions.set(id, updated);
    return updated;
  }

  async deleteSession(id: string): Promise<boolean> {
    // Also delete all messages in this session
    const messagesToDelete = Array.from(this.messages.values())
      .filter(msg => msg.sessionId === id)
      .map(msg => msg.id);
    
    messagesToDelete.forEach(msgId => this.messages.delete(msgId));
    
    return this.sessions.delete(id);
  }

  // Messages
  async getMessages(sessionId: string): Promise<Message[]> {
    return Array.from(this.messages.values())
      .filter(msg => msg.sessionId === sessionId)
      .sort((a, b) => new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime());
  }

  async getMessage(id: string): Promise<Message | undefined> {
    return this.messages.get(id);
  }

  async createMessage(insertMessage: InsertMessage): Promise<Message> {
    const id = randomUUID();
    const message: Message = {
      id,
      ...insertMessage,
      createdAt: new Date(),
    };
    this.messages.set(id, message);

    // Update session's updatedAt
    const session = this.sessions.get(insertMessage.sessionId);
    if (session) {
      this.sessions.set(session.id, { ...session, updatedAt: new Date() });
    }

    return message;
  }

  async deleteMessage(id: string): Promise<boolean> {
    return this.messages.delete(id);
  }

  // Attachments
  async createAttachment(insertAttachment: InsertAttachment): Promise<Attachment> {
    const id = randomUUID();
    const attachment: Attachment = {
      id,
      ...insertAttachment,
      createdAt: new Date(),
    };
    this.attachments.set(id, attachment);
    return attachment;
  }

  async getAttachment(id: string): Promise<Attachment | undefined> {
    return this.attachments.get(id);
  }
}

export const storage = new MemStorage();
