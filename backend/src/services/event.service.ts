import { IEventRepository } from "../repositories/event.repository";
import { CreateEventDTOType, UpdateEventDTOType } from "../dtos/event.dto";
import { HttpException } from "../exceptions/http-exception";

export class EventService {
  constructor(private readonly eventRepository: IEventRepository) {}

  async getAllEvents() {
    return this.eventRepository.findAll();
  }

  async getEventById(id: string) {
    const event = await this.eventRepository.findById(id);
    if (!event) {
      throw new HttpException(404, "Event not found");
    }
    return event;
  }

  async createEvent(data: CreateEventDTOType, organizerId: string) {
    return this.eventRepository.create({
      ...data,
      organizer: organizerId,
    });
  }

  async updateEvent(id: string, data: UpdateEventDTOType, userId: string, userRole: string) {
    const event = await this.getEventById(id);
    
    // Check ownership: only organizer or admin can edit
    // Note: event.organizer populated object might need ._id check or toString()
    const organizerIdStr = event.organizer && typeof event.organizer === 'object' && '_id' in event.organizer
      ? (event.organizer as any)._id.toString()
      : event.organizer.toString();

    if (organizerIdStr !== userId && userRole !== "admin") {
      throw new HttpException(403, "You do not have permission to update this event");
    }

    if (data.capacity !== undefined && data.capacity < event.registeredCount) {
      throw new HttpException(400, `Capacity cannot be lower than registered users (${event.registeredCount})`);
    }

    return this.eventRepository.update(id, data);
  }

  async deleteEvent(id: string, userId: string, userRole: string) {
    const event = await this.getEventById(id);

    const organizerIdStr = event.organizer && typeof event.organizer === 'object' && '_id' in event.organizer
      ? (event.organizer as any)._id.toString()
      : event.organizer.toString();

    if (organizerIdStr !== userId && userRole !== "admin") {
      throw new HttpException(403, "You do not have permission to delete this event");
    }

    return this.eventRepository.delete(id);
  }
}
