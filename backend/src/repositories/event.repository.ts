import { IEvent, EventModel } from "../models/event.model";
import { CreateEventDTOType, UpdateEventDTOType } from "../dtos/event.dto";

export interface IEventRepository {
  findAll(): Promise<IEvent[]>;
  findById(id: string): Promise<IEvent | null>;
  create(data: CreateEventDTOType & { organizer: string }): Promise<IEvent>;
  update(id: string, data: UpdateEventDTOType): Promise<IEvent | null>;
  delete(id: string): Promise<IEvent | null>;
  incrementRegisteredCount(id: string, count: number): Promise<IEvent | null>;
}

export class EventMongoRepository implements IEventRepository {
  async findAll(): Promise<IEvent[]> {
    return EventModel.find().populate("organizer", "firstName lastName email username").sort({ date: 1 });
  }

  async findById(id: string): Promise<IEvent | null> {
    return EventModel.findById(id).populate("organizer", "firstName lastName email username");
  }

  async create(data: CreateEventDTOType & { organizer: string }): Promise<IEvent> {
    const event = new EventModel(data);
    return event.save();
  }

  async update(id: string, data: UpdateEventDTOType): Promise<IEvent | null> {
    return EventModel.findByIdAndUpdate(id, data, { new: true }).populate("organizer", "firstName lastName email username");
  }

  async delete(id: string): Promise<IEvent | null> {
    return EventModel.findByIdAndDelete(id);
  }

  async incrementRegisteredCount(id: string, count: number): Promise<IEvent | null> {
    return EventModel.findByIdAndUpdate(
      id,
      { $inc: { registeredCount: count } },
      { new: true }
    );
  }
}
