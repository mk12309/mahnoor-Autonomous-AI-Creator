/**
 * System Constants
 * 
 * Responsibility:
 * Defines app-wide constants, statuses, and enum values.
 */

const TOPIC_STATUS = {
  DISCOVERED: 'discovered',
  EVALUATED: 'evaluated',
  ACCEPTED: 'accepted',
  REJECTED: 'rejected',
  USED: 'used',
};

const POST_STATUS = {
  DRAFT: 'draft',
  QUEUED: 'queued',
  APPROVED: 'approved',
  PUBLISHED: 'published',
  REJECTED: 'rejected',
};

module.exports = { TOPIC_STATUS, POST_STATUS };
