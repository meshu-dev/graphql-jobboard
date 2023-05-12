import { GraphQLError } from 'graphql'; 
import { getJobs, getJob, getJobsByCompany, createJob, updateJob, deleteJob } from './db/jobs.js'; 
import { getCompany } from './db/companies.js'; 

export const resolvers = {
  Query: {
    jobs: () => getJobs(),
    job: async (_root, { id }) => {
      const job = await getJob(id);

      if (!job) {
        notFoundError(`No job found with id ${id}`);
      }

      return job;
    },
    company: async (_root, { id }) => {
      const company = await getCompany(id);

      if (!company) {
        notFoundError(`No company found with id ${id}`);
      }

      return company;
    }
  },
  Mutation: {
    createJob: (_root, { input: { title, description } }, { user }) => {
      if (!user) {
        throw unauthorizedError('Missing authentication');
      }
      return createJob({ companyId: user.companyId, title, description });
    },
    updateJob: (_root, { input: { id, title, description } }) => {
      return updateJob({ id, title, description });
    },
    deleteJob: (_root, { id }) => deleteJob(id)
  },
  Job: {
    date: (job) => toIsoDate(job.createdAt),
    company: (job) => getCompany(job.companyId)
  },
  Company: {
    jobs: (company) => getJobsByCompany(company.id)
  }
};

function toIsoDate(value) {
  return value.slice(0, 'yyyy-mm-dd'.length);
}

function unauthorizedError(message) {
  return new GraphQLError(message, {
    extensions: { code: 'UNAUTHORIZED' },
  });
}

function notFoundError(message) {
  throw new GraphQLError(
    message,
    { extentions: { code: 'NOT_FOUND' } }
  );
}
