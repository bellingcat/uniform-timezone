import moment from 'moment-timezone';
import Fixer from '../fixer.js';

/**
 * This script enables uniform timestamps for linkedin.com.
 * Timestamps handled by this script:
 *  - Publication
 *  - Comment
 * Known limitation:
 * 	- Doesn't get the publication URL
*/
const fixer = new Fixer('LinkedIn', [
	{
		name: 'Publication Timestamp',
		selector: 'span.update-components-actor__sub-description > span',
		attachTo: node => node,
		timestamp: getPublicationTimestamp,
		filterSelected: checkPostUrl,
		label: 'publication',
		url: _ => window.location.origin + window.location.pathname,
	},
	{
		name: 'Comment Timestamp',
		selector: 'time.comments-comment-meta__data',
		attachTo: node => node,
		timestamp: getCommentTimestamp,
		label: 'comment',
		url: getCommentUrl,
	},
]);

function getPublicationTimestamp(_) {
	if (document.URL.startsWith('https://www.linkedin.com/posts/')) {
		const linkedinURL = document.URL;
		const regex = /(\d{19})/;
		const postId = regex.exec(linkedinURL)?.pop();
		if (postId !== undefined) {
			const first41Bits = Number.parseInt((Number.parseInt(postId, 10)).toString(2).slice(0, 41), 2);
			return moment.unix(first41Bits / 1000);
		}
	}

	return null;
}

function getCommentTimestamp(node) {
	const parnt = node.closest('.comments-comment-entity');
	if (parnt.getAttributeNames().includes('data-id')) {
		const _id = Number.parseInt(parnt.dataset.id.split(':')[4].split(',')[1], 10);
		const first41Bits = Number.parseInt((_id).toString(2).slice(0, 41), 2);
		return moment.unix(first41Bits / 1000);
	}

	return null;
}

function getCommentUrl(node) {
	const parnt = node.closest('.comments-comment-entity');
	if (parnt.getAttributeNames().includes('data-id')) {
		const commentInfo = parnt.dataset.id;
		const postId = commentInfo.split(':')[4].split(',')[0];
		return 'https://www.linkedin.com/feed/update/urn:li:activity:' + postId + '/?commentUrn=' + encodeURIComponent(commentInfo);
	}

	return null;
}

function checkPostUrl(_) {
	return document.URL.startsWith('https://www.linkedin.com/posts/');
}

fixer.start();
