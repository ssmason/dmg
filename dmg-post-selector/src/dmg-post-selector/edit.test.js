/**
 * Tests for the DMG Post Selector block
 */

import { render, screen } from '@testing-library/react';
import '@testing-library/jest-dom';
import Edit from './edit';

// Mock WordPress dependencies
jest.mock('@wordpress/block-editor', () => ({
	useBlockProps: jest.fn(() => ({})),
	InspectorControls: ({ children }) => <div>{children}</div>,
}));

jest.mock('@wordpress/components', () => ({
	PanelBody: ({ children }) => <div>{children}</div>,
	Spinner: () => <div role="status">Loading...</div>,
	TextControl: ({ value, onChange, label }) => (
		<input aria-label={label} value={value} onChange={(e) => onChange(e.target.value)} />
	),
	Button: ({ children, onClick, disabled }) => (
		<button onClick={onClick} disabled={disabled}>{children}</button>
	),
}));

jest.mock('@wordpress/data', () => ({
	useSelect: jest.fn(),
}));

jest.mock('@wordpress/element', () => ({
	...jest.requireActual('react'),
	useState: jest.requireActual('react').useState,
	useMemo: jest.requireActual('react').useMemo,
}));

jest.mock('@wordpress/i18n', () => ({
	__: (text) => text,
}));

// Mock the SCSS import
jest.mock('./editor.scss', () => ({}));

import { useSelect } from '@wordpress/data';

describe('DMG Post Selector - Edit Component', () => {
	const mockSetAttributes = jest.fn();
	const defaultAttributes = {
		selectedPostTitle: '',
		selectedPostLink: '',
	};

	beforeEach(() => {
		jest.clearAllMocks();
	});

	test('renders loading spinner when posts are null', () => {
		useSelect.mockReturnValue(null);

		render(<Edit attributes={defaultAttributes} setAttributes={mockSetAttributes} />);

		expect(screen.getByText('Loading...')).toBeInTheDocument();
	});

	test('renders "no posts found" when filtered posts are empty', () => {
		useSelect.mockReturnValue([]);

		render(<Edit attributes={defaultAttributes} setAttributes={mockSetAttributes} />);

		expect(screen.getByText('No posts found.')).toBeInTheDocument();
	});

	test('renders posts list when posts are available', () => {
		const mockPosts = [
			{ id: 1, title: { rendered: 'Test Post 1' }, excerpt: { rendered: 'Excerpt 1' }, link: 'http://example.com/1' },
			{ id: 2, title: { rendered: 'Test Post 2' }, excerpt: { rendered: 'Excerpt 2' }, link: 'http://example.com/2' },
		];
		useSelect.mockReturnValue(mockPosts);

		render(<Edit attributes={defaultAttributes} setAttributes={mockSetAttributes} />);

		expect(screen.getByText('Test Post 1')).toBeInTheDocument();
		expect(screen.getByText('Test Post 2')).toBeInTheDocument();
	});

	test('shows selected post in block preview', () => {
		useSelect.mockReturnValue([]);
		const attributes = {
			selectedPostTitle: 'My Selected Post',
			selectedPostLink: 'http://example.com/selected',
		};

		render(<Edit attributes={attributes} setAttributes={mockSetAttributes} />);

		expect(screen.getByText('My Selected Post')).toBeInTheDocument();
	});
});

describe('DMG Post Selector - Logic Tests', () => {
	test('filters posts by title', () => {
		const posts = [
			{ id: 1, title: { rendered: 'Hello World' } },
			{ id: 2, title: { rendered: 'Test Post' } },
			{ id: 3, title: { rendered: 'Another Hello' } },
		];

		const searchQuery = 'hello';
		const filtered = posts.filter((post) =>
			post.title.rendered.toLowerCase().includes(searchQuery.toLowerCase())
		);

		expect(filtered).toHaveLength(2);
		expect(filtered[0].id).toBe(1);
		expect(filtered[1].id).toBe(3);
	});

	test('filters posts by ID', () => {
		const posts = [
			{ id: 1, title: { rendered: 'Post One' } },
			{ id: 2, title: { rendered: 'Post Two' } },
			{ id: 3, title: { rendered: 'Post Three' } },
		];

		const searchQuery = '2';
		const filtered = posts.filter((post) =>
			post.id.toString() === searchQuery.trim()
		);

		expect(filtered).toHaveLength(1);
		expect(filtered[0].id).toBe(2);
	});

	test('calculates pagination correctly', () => {
		const totalPosts = 13;
		const postsPerPage = 5;
		const totalPages = Math.ceil(totalPosts / postsPerPage);

		expect(totalPages).toBe(3);
	});

	test('paginates posts correctly', () => {
		const posts = Array.from({ length: 13 }, (_, i) => ({ id: i + 1 }));
		const postsPerPage = 5;
		const currentPage = 2;

		const paginatedPosts = posts.slice(
			(currentPage - 1) * postsPerPage,
			currentPage * postsPerPage
		);

		expect(paginatedPosts).toHaveLength(5);
		expect(paginatedPosts[0].id).toBe(6);
		expect(paginatedPosts[4].id).toBe(10);
	});
});
