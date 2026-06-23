import { IRegistrationRepository } from "../repositories/registration.repository";
import { IEventRepository } from "../repositories/event.repository";
import { HttpException } from "../exceptions/http-exception";

export class RegistrationService {
  constructor(
    private readonly registrationRepository: IRegistrationRepository,
    private readonly eventRepository: IEventRepository
  ) {}

  async registerForEvent(userId: string, eventId: string) {
    const event = await this.eventRepository.findById(eventId);
    if (!event) {
      throw new HttpException(404, "Event not found");
    }

    // Check capacity
    if (event.registeredCount >= event.capacity) {
      throw new HttpException(400, "Event is already at full capacity");
    }

    // Check if user is already registered
    const existingRegistration = await this.registrationRepository.findByUserAndEvent(userId, eventId);
    if (existingRegistration) {
      throw new HttpException(409, "You are already registered for this event");
    }

    // Create registration
    const registration = await this.registrationRepository.create({
      user: userId,
      event: eventId,
    });

    // Increment count on event
    await this.eventRepository.incrementRegisteredCount(eventId, 1);

    return registration;
  }

  async cancelRegistration(userId: string, registrationId: string) {
    const registration = await this.registrationRepository.findById(registrationId);
    if (!registration) {
      throw new HttpException(404, "Registration record not found");
    }

    // Check ownership
    if (registration.user.toString() !== userId) {
      throw new HttpException(403, "You do not have permission to cancel this registration");
    }

    const eventId = registration.event.toString();

    // Delete registration
    await this.registrationRepository.delete(registrationId);

    // Decrement count on event
    await this.eventRepository.incrementRegisteredCount(eventId, -1);

    return { message: "Registration cancelled successfully" };
  }

  async getUserRegistrations(userId: string) {
    return this.registrationRepository.findByUser(userId);
  }

  async getEventRegistrations(eventId: string) {
    return this.registrationRepository.findByEvent(eventId);
  }
}
