import { IRegistration, RegistrationModel } from "../models/registration.model";

export interface IRegistrationRepository {
  findByUserAndEvent(userId: string, eventId: string): Promise<IRegistration | null>;
  findByUser(userId: string): Promise<IRegistration[]>;
  findByEvent(eventId: string): Promise<IRegistration[]>;
  findById(id: string): Promise<IRegistration | null>;
  create(data: { user: string; event: string }): Promise<IRegistration>;
  delete(id: string): Promise<IRegistration | null>;
}

export class RegistrationMongoRepository implements IRegistrationRepository {
  async findByUserAndEvent(userId: string, eventId: string): Promise<IRegistration | null> {
    return RegistrationModel.findOne({ user: userId, event: eventId });
  }

  async findByUser(userId: string): Promise<IRegistration[]> {
    return RegistrationModel.find({ user: userId })
      .populate({
        path: "event",
        populate: {
          path: "organizer",
          select: "firstName lastName email username",
        },
      })
      .sort({ createdAt: -1 });
  }

  async findByEvent(eventId: string): Promise<IRegistration[]> {
    return RegistrationModel.find({ event: eventId }).populate("user", "firstName lastName email username");
  }

  async findById(id: string): Promise<IRegistration | null> {
    return RegistrationModel.findById(id);
  }

  async create(data: { user: string; event: string }): Promise<IRegistration> {
    const registration = new RegistrationModel(data);
    return registration.save();
  }

  async delete(id: string): Promise<IRegistration | null> {
    return RegistrationModel.findByIdAndDelete(id);
  }
}
