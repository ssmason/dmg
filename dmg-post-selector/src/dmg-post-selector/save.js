import { useBlockProps } from '@wordpress/block-editor';

export default function save( { attributes } ) {
	const { selectedPostTitle, selectedPostLink } = attributes;

	return (
		<div {...useBlockProps.save()}>
			{ selectedPostTitle && selectedPostLink ? (
				<p className="dmg-read-more">
					Read more: <a href={selectedPostLink} target="_blank" rel="noopener noreferrer">
						{selectedPostTitle}
					</a>
				</p>
			) : (
				<p className="dmg-read-more">No post selected.</p>
			) }
		</div>
	);
}
