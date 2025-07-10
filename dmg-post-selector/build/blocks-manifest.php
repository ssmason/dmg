<?php
// This file is generated. Do not modify it manually.
return array(
	'dmg-post-selector' => array(
		'$schema' => 'https://schemas.wp.org/trunk/block.json',
		'apiVersion' => 3,
		'name' => 'create-block/dmg-post-selector',
		'version' => '0.1.0',
		'title' => 'Dmg Post Selector',
		'category' => 'widgets',
		'icon' => 'smiley',
		'description' => 'Example block scaffolded with Create Block tool.',
		'example' => array(
			
		),
		'supports' => array(
			'html' => false
		),
		'attributes' => array(
			'selectedPostTitle' => array(
				'type' => 'string'
			),
			'selectedPostLink' => array(
				'type' => 'string'
			)
		),
		'textdomain' => 'dmg-post-selector',
		'editorScript' => 'file:./index.js',
		'editorStyle' => 'file:./index.css',
		'viewScript' => 'file:./view.js',
		'style' => 'file:./style.css'
	)
);
