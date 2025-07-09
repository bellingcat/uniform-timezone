import moment from 'moment-timezone';
import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for linkedin.com.
 * Timestamps handled by this script:
 *   - Publication
 *   - Comment
 * Known limitation:
 * - Doesn't get the publication URL
*/
const fixer = new Fixer('LinkedIn', [
	{
		name: 'Publication Timestamp',
		selector: 'span.update-components-actor__sub-description > span',
		attachTo: node => node,
		timestamp: getPublicationTimestamp,
		label: 'publication',
    url: _ => null
	},
	{
		name: 'Comment Timestamp',
		selector: 'time.comments-comment-meta__data',
		attachTo: node => node,
		timestamp: getCommentTimestamp,
		label: 'comment',
    url: getCommentUrl
  }
]);

function getPublicationTimestamp(node) {
  // TODO: try to get it from URL
  const parnt = node.closest(".feed-shared-update-v2");
  if (parnt.getAttributeNames().includes("data-urn")) {
    const _id = parseInt(parnt.getAttribute("data-urn").split(":")[3], 10)
    const first_41_bits = parseInt((_id).toString(2).substr(0, 41), 2)
    return moment.unix(first_41_bits / 1000.0)
  }
  return null
}

function getCommentTimestamp(node) {
  const parnt = node.closest(".comments-comment-entity");
  if (parnt.getAttributeNames().includes("data-id")) {
    const _id = parseInt(parnt.getAttribute("data-id").split(":")[4].split(",")[1], 10)
    const first_41_bits = parseInt((_id).toString(2).substr(0, 41), 2)
    return moment.unix(first_41_bits / 1000.0)
  }
  return null
}

function getCommentUrl(node) {
  const parnt = node.closest(".comments-comment-entity");
  if (parnt.getAttributeNames().includes("data-id")) {
    const comment_info = parnt.getAttribute("data-id");
    const post_id = comment_info.split(":")[4].split(",")[0];
    return "https://www.linkedin.com/feed/update/urn:li:activity:" + post_id + "/?commentUrn=" + encodeURIComponent(comment_info)
  }
  return null
}

fixer.start();
