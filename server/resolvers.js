const { User, Application } = require('./sequelize.js');

// graphQL resolvers
const resolvers = {
  Status: {
    PLANNED: 'planned',
    APPLIED: 'applied',
    REJECTED: 'rejected',
    INTERVIEW_SCHEDULED: 'interview scheduled',
    OFFERED: 'offered',
  },
  Application: {
    notes: (parent, args) => {
      console.log('Application parent ->', parent);
    },
  },
  Query: {
    hello: () => 'hello world!',
    getAllUsers: async () => {
      const allUsers = await User.findAll();
      return allUsers.map((user) => ({
        id: user.dataValues.id,
        username: user.dataValues.username,
        email: user.dataValues.email,
        password: user.dataValues.password,
      }));
    },
    getUserApplications: async (parent, { userId }) => {
      const userApps = await Application.findAll({
        where: {
          user_id: userId,
        },
      });
      return userApps.map((application) => ({
        id: application.dataValues.id,
        user_id: application.dataValues.user_id,
        company: application.dataValues.company,
        position: application.dataValues.position,
        url: application.dataValues.url,
        created_at: application.dataValues.created_at,
        recent_activity: application.dataValues.recent_activity,
        status: application.dataValues.status,
        notes: application.dataValues.notes,
      }));
    },
  },
  Mutation: {
    login: (parent, args, context, info) => {
      return args.userInfo.username;
    },
    addUser: async (parent, { userInfo }) => {
      const { username, password, email } = userInfo;
      const newUser = await User.create({ username, password, email });
      return newUser;
    },
    addApplication: async (parent, { newAppInfo }) => {
      const { user_id, company, position, url, notes, status } = newAppInfo;
      const newApp = await Application.create({ user_id, company, position, url, status, notes });
      return newApp;
    },
    editApplication: async (parent, { editedAppInfo }) => {
      const { id } = editedAppInfo;
      const updateData = {};
      Object.keys(editedAppInfo).forEach((key) => {
        if (key !== 'id') updateData[key] = editedAppInfo[key];
      });
      // eslint-disable-next-line prefer-destructuring
      updateData.recent_activity = new Date().toISOString().split('T')[0];
      console.log(updateData);
      const editedApp = await Application.update(updateData, {
        where: {
          id,
        },
        returning: true,
      });
      return editedApp[1][0].dataValues;
    },
    archiveApplication: async (parent, { id }) => {
      const archivedApp = await Application.update(
        { archive: true },
        {
          where: {
            id,
          },
          returning: true,
        }
      );
      return archivedApp[1][0].dataValues;
    },
    test: async (parent, args, context, info) => {
      const newUser = await User.create({ username: 't', password: 't', email: 't' });
      return newUser;
    },
  },
};

module.exports = { resolvers };