const mongoose = require("mongoose");
const httpStatus = require("http-status");
const bcrypt = require("bcryptjs");
const { compact, isEmpty, pick } = require("lodash");
const APIError = require("../APIError");
const { env } = require("../vars");

const ProfileSchema = mongoose.Schema(
  {
    email: {
      type: String,
      match: /^\S+@\S+\.\S+$/,
      required: true,
      unique: true,
      trim: true,
      lowercase: true
    },
    password: {
      type: String,
      required: true,
      minlength: 6,
      maxlength: 128
    },
    image_url: {
      type: String,
      trim: true
    },
    display_name: {
      type: String,
      trim: true
    },
    about: {
      type: String
    },
    location: {
      type: String
    },
    website: {
      type: String,
      trim: true
    },
    phone: {
      type: String
    },
    eos_account: {
      type: String,
      trim: true
    }
  },
  {
    timestamps: true,
    toJSON: { virtuals: true }
  }
);

ProfileSchema.pre("save", async function save(next) {
  try {
    if (!this.isModified("password")) return next();

    const rounds = env === "test" ? 1 : 10;

    const hash = await bcrypt.hash(this.password, rounds);
    this.password = hash;

    return next();
  } catch (error) {
    return next(error);
  }
});

const fields = [
  "id",
  "display_name",
  "email",
  "image_url",
  "phone",
  "about",
  "location",
  "website",
  "eos_account",
  "createdAt"
];

ProfileSchema.method({
  transform() {
    const transformed = {};

    fields.forEach(field => {
      transformed[field] = this[field];
    });

    return transformed;
  },

  async passwordMatches(password) {
    const matches = await bcrypt.compare(password, this.password);
    return matches;
  }
});

/**
 * Statics
 */
ProfileSchema.statics = {
  /**
   * Get user profile by email address
   *
   * @param {String} email - The email address of the user.
   * @returns {Promise<User, APIError>}
   */
  async getByEmail(email) {
    const user = await this.findOne({ email }).exec();
    if (!user) {
      throw new APIError({
        status: httpStatus.NOT_FOUND,
        message: "User email not found or invalid"
      });
    }
    return user;
  },

  /**
   * Find user by email and tries to generate a JWT token
   *
   * @param {ObjectId} id - The objectId of user.
   * @returns {Promise<User, APIError>}
   */
  async findAndValidate(options) {
    const { email, password } = options;
    if (!email) {
      throw new APIError({
        message: "An email is required to login"
      });
    }

    const user = await this.findOne({ email }).exec();
    const err = {
      status: httpStatus.UNAUTHORIZED,
      isPublic: true
    };
    if (!user) {
      err.message = "Unknown email address";
    } else if (password) {
      const matches = await user.passwordMatches(password);
      if (user && matches) {
        return user;
      }
      err.message = "Incorrect email or password";
    } else {
      err.message = "Incorrect or missing password for email";
    }
    throw new APIError(err);
  },

  /**
   * Return new validation error
   * if error is a mongoose duplicate key error
   *
   * @param {Error} error
   * @returns {Error|APIError}
   */
  checkDuplicateEmail(error) {
    if (error.name === "MongoError" && error.code === 11000) {
      return new APIError({
        message: "Validation Error",
        errors: [
          {
            field: "email",
            location: "body",
            messages: ['"email" already exists']
          }
        ],
        status: httpStatus.CONFLICT,
        isPublic: true,
        stack: error.stack
      });
    }
    return error;
  },

  /**
   * List profiles
   *
   * @param {number} skip - Number of entities to be skipped.
   * @param {number} limit - Limit number of entities to be returned.
   * @param {Object} [sort] - Object w/ keys matching fieldnames to be sorted, values as -1 (desc), 1 (asc)
   * @param {Object} [filter] - Object matching a MongoDB query object
   * @param {Object|String} [projection] - MongoDB $projection object denoting fields to include/exclude
   * @returns {Promise<Profile[]>}
   */
  list({ skip = 0, limit = 30, sort, filter, projection }) {
    const $match = isEmpty(filter) ? null : { $match: filter };
    const $project = projection ? { $project: projection } : null;
    const $skip = { $skip: skip };
    const $limit = { $limit: limit };
    const $sort = sort ? { $sort: sort } : null;

    const agg = compact([$match, $project, $sort, $skip, $limit]);

    return this.aggregate(agg)
      .exec()
      .then(profiles => profiles.map(profile => pick(profile, fields)));
  }
};

const Profile = mongoose.model("Profile", ProfileSchema);

module.exports = Profile;
