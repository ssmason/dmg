/**
 * Retrieves the translation of text.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-i18n/
 */
import { __ } from '@wordpress/i18n';

/**
 * React hook that is used to mark the block wrapper element.
 * It provides all the necessary props like the class name.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/packages/packages-block-editor/#useblockprops
 */
import { useBlockProps } from '@wordpress/block-editor';

/**
 * Lets webpack process CSS, SASS or SCSS files referenced in JavaScript files.
 * Those files can contain any CSS code that gets applied to the editor.
 *
 * @see https://www.npmjs.com/package/@wordpress/scripts#using-css
 */
import './editor.scss';

/**
 * The edit function describes the structure of your block in the context of the
 * editor. This represents what the editor will render when the block is used.
 *
 * @see https://developer.wordpress.org/block-editor/reference-guides/block-api/block-edit-save/#edit
 *
 * @return {Element} Element to render.
 */

/* https://developer.wordpress.org/block-editor/reference-guides/packages/packages-components/ */
import { PanelBody, Spinner } from '@wordpress/components';

/* https://developer.wordpress.org/block-editor/reference-guides/packages/packages-data/#useselect */
import { useSelect } from '@wordpress/data';

import { InspectorControls } from '@wordpress/block-editor';

import { useState } from '@wordpress/element';

import { TextControl } from '@wordpress/components';

import { Button } from '@wordpress/components';

/**
 * The Edit component for the DMG Post Selector block.
 *
 * This component fetches and displays a list of posts in the editor sidebar.
 * It uses the WordPress data store to retrieve posts and displays them in a
 * panel within the block's inspector controls.
 *
 * @returns {JSX.Element} The rendered edit component.
 */
export default function Edit( { attributes, setAttributes } ) {

	// Search constants
	const { selectedPostTitle, selectedPostLink } = attributes;
	const [searchQuery, setSearchQuery]           = useState('');

	// Pagination constants
	const [currentPage, setCurrentPage] = useState(1);
	const postsPerPage = 5;

	// query the posts from the WordPress REST API
	const posts = useSelect( ( select ) => {
		const { getEntityRecords } = select( 'core' );
		return getEntityRecords( 'postType', 'post', { per_page: -1, orderby: 'date', order: 'asc' } );
	}, [] );

	// Ensure posts is an array
	const allPosts = Array.isArray(posts) ? posts : [];
	// Filter posts based on search query
	const filteredPosts = allPosts.filter((post) => {
		if (!searchQuery) return true;

		const lowerQuery = searchQuery.toLowerCase();
		const titleMatch = post.title.rendered.toLowerCase().includes(lowerQuery);
		const idMatch = post.id.toString() === searchQuery.trim();

		return titleMatch || idMatch;
	});

	// Calculate pagination
	const totalPages = Math.ceil(filteredPosts.length / postsPerPage);

	const paginatedPosts = filteredPosts.slice(
		(currentPage - 1) * postsPerPage,
		currentPage * postsPerPage
	);


	const handlePrev = () => {
		if (currentPage > 1) setCurrentPage(currentPage - 1);
	};

	const handleNext = () => {
		if (currentPage < totalPages) setCurrentPage(currentPage + 1);
	};

	return (
		<>
			<InspectorControls>
				{/* Search input */}
				<TextControl
					label="Search posts"
					value={searchQuery}
					onChange={(value) => {
						setSearchQuery(value);
						setCurrentPage(1); // Reset pagination on new search
					}}
					placeholder="Enter title or ID"
					className='dmg-post-selector-search'
				/>
				{/* Panel body that holds posts and pagination */}
				<PanelBody title="Select a Post" initialOpen={ true }>
					{ !posts ? (
						<Spinner />
					) : filteredPosts.length === 0 ? ( 
							<p style={{ fontStyle: 'italic', color: '#ff0000' }}>
								No posts found.
							</p>
						) : (
						<ul>
							{ paginatedPosts.map((post) => {
								const rawExcerpt = post.excerpt?.rendered || '';
								const plainExcerpt = rawExcerpt.replace(/<[^>]+>/g, '');
								const shortExcerpt = plainExcerpt.split(/\s+/).slice(0, 20).join(' ') + '...';
								
								return (
									<li key={post.id} onClick={() => setAttributes({
										selectedPostTitle: post.title.rendered,
										selectedPostLink: post.link
									})}>
									<p><strong>{post.title.rendered}</strong></p>
									<p>{shortExcerpt}</p>
									</li>
								);
							}) }
						</ul> 
					) }
					 
					{/* Pagination controls */}
					{totalPages > 1 && (
						<div style={{ display: 'flex', gap: '10px', alignItems: 'center', marginTop: '10px' }}>
							<Button onClick={handlePrev} disabled={currentPage === 1}>
								Previous
							</Button>
							<span>Page {currentPage} of {totalPages}</span>
							<Button onClick={handleNext} disabled={currentPage === totalPages}>
								Next
							</Button>
						</div>
					)}
				</PanelBody>
			</InspectorControls>

			<div {...useBlockProps()}>
				{ selectedPostTitle && selectedPostLink ? ( 
					<p className="dmg-read-more"> 
						<a href={selectedPostLink} target="_blank" rel="noopener noreferrer">
							{selectedPostTitle}
						</a>
					</p>
				 ) : (
				     <p>Select a post in the inspector - </p>
				 ) }
			</div>
		</>
		 
	);
}
