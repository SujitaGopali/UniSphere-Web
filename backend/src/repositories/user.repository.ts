import { IUser, UserModel } from "../models/user.model";
import { CreateUserDTOType } from "../dtos/user.dto";

export interface IUserRepository {
  findByEmail(email: string): Promise<IUser | null>;
  findByUsername(username: string): Promise<IUser | null>;
  findByStudentId(studentId: string): Promise<IUser | null>;
  findById(id: string): Promise<IUser | null>;
  create(data: CreateUserDTOType & { password: string; role: "admin" | "user" }): Promise<IUser>;
  update(id: string, data: Partial<IUser>): Promise<IUser | null>;
  countUsers(search?: string): Promise<number>;
  findAllWithPaginationAndSearch(page: number, limit: number, search?: string): Promise<IUser[]>;
  countPendingVerifications(college?: string): Promise<number>;
  findPendingVerifications(page: number, limit: number, college?: string): Promise<IUser[]>;
  deleteById(id: string): Promise<boolean>;
}

export class UserMongoRepository implements IUserRepository {
  private escapeRegex(value: string): string {
    return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
  }

  private getFullNameExpression() {
    return {
      $trim: {
        input: {
          $concat: ["$firstName", " ", "$lastName"],
        },
      },
    };
  }

  private buildUserSearchQuery(search?: string) {
    if (!search?.trim()) {
      return {};
    }

    const safeSearch = this.escapeRegex(search.trim());

    return {
      $or: [
        { firstName: { $regex: safeSearch, $options: "i" } },
        { lastName: { $regex: safeSearch, $options: "i" } },
        { email: { $regex: safeSearch, $options: "i" } },
        { username: { $regex: safeSearch, $options: "i" } },
        {
          $expr: {
            $regexMatch: {
              input: this.getFullNameExpression(),
              regex: safeSearch,
              options: "i",
            },
          },
        },
      ],
    };
  }

  async findByEmail(email: string): Promise<IUser | null> {
    const normalizedEmail = email.trim().toLowerCase();
    return UserModel.findOne({ email: normalizedEmail });
  }

  async findByUsername(username: string): Promise<IUser | null> {
    return UserModel.findOne({ username });
  }

  async findByStudentId(studentId: string): Promise<IUser | null> {
    return UserModel.findOne({ studentId });
  }

  async findById(id: string): Promise<IUser | null> {
    return UserModel.findById(id);
  }

  async create(
    data: CreateUserDTOType & { password: string; role: "admin" | "user" }
  ): Promise<IUser> {
    const normalizedData = {
      ...data,
      email: data.email.trim().toLowerCase(),
    };
    const user = new UserModel(normalizedData);
    return user.save();
  }

  async update(id: string, data: Partial<IUser>): Promise<IUser | null> {
    return UserModel.findByIdAndUpdate(id, data, { new: true });
  }
  async countUsers(search?: string): Promise<number> {
    const query = this.buildUserSearchQuery(search);

    return UserModel.countDocuments(query);
  }

  async findAllWithPaginationAndSearch(
    page: number,
    limit: number,
    search?: string
  ): Promise<IUser[]> {
    const query = this.buildUserSearchQuery(search);
    const trimmedSearch = search?.trim();

    if (!trimmedSearch) {
      return UserModel.find(query)
        .skip((page - 1) * limit)
        .limit(limit)
        .sort({ createdAt: -1 });
    }

    const safeSearch = this.escapeRegex(trimmedSearch);
    const exactMatch = new RegExp(`^${safeSearch}$`, "i");
    const startsWithMatch = new RegExp(`^${safeSearch}`, "i");
    const fullNameExpression = this.getFullNameExpression();

    const rankedUsers = await UserModel.aggregate([
      { $match: query },
      {
        $addFields: {
          searchRank: {
            $switch: {
              branches: [
                {
                  case: { $regexMatch: { input: fullNameExpression, regex: exactMatch } },
                  then: 0,
                },
                {
                  case: { $regexMatch: { input: "$username", regex: exactMatch } },
                  then: 1,
                },
                {
                  case: { $regexMatch: { input: fullNameExpression, regex: startsWithMatch } },
                  then: 2,
                },
                {
                  case: { $regexMatch: { input: "$username", regex: startsWithMatch } },
                  then: 3,
                },
                {
                  case: {
                    $or: [
                      { $regexMatch: { input: "$firstName", regex: exactMatch } },
                      { $regexMatch: { input: "$lastName", regex: exactMatch } },
                      { $regexMatch: { input: "$email", regex: exactMatch } },
                    ],
                  },
                  then: 4,
                },
                {
                  case: {
                    $or: [
                      { $regexMatch: { input: "$firstName", regex: startsWithMatch } },
                      { $regexMatch: { input: "$lastName", regex: startsWithMatch } },
                      { $regexMatch: { input: "$email", regex: startsWithMatch } },
                    ],
                  },
                  then: 5,
                },
              ],
              default: 6,
            },
          },
        },
      },
      { $sort: { searchRank: 1, createdAt: -1 } },
      { $skip: (page - 1) * limit },
      { $limit: limit },
      { $project: { searchRank: 0 } },
    ]);

    return rankedUsers.map((user) => UserModel.hydrate(user));
  }

  // College names are stored as free text chosen from a dropdown, so match them
  // case-insensitively and ignore surrounding whitespace rather than exactly.
  private buildPendingVerificationQuery(college?: string) {
    const query: Record<string, unknown> = { verificationStatus: "pending" };

    if (college?.trim()) {
      query.college = new RegExp(`^\\s*${this.escapeRegex(college.trim())}\\s*$`, "i");
    }

    return query;
  }

  async countPendingVerifications(college?: string): Promise<number> {
    return UserModel.countDocuments(this.buildPendingVerificationQuery(college));
  }

  async findPendingVerifications(
    page: number,
    limit: number,
    college?: string
  ): Promise<IUser[]> {
    return UserModel.find(this.buildPendingVerificationQuery(college))
      .skip((page - 1) * limit)
      .limit(limit)
      .sort({ updatedAt: -1 });
  }

  async deleteById(id: string): Promise<boolean> {
    const result = await UserModel.findByIdAndDelete(id);
    return !!result;
  }
}
