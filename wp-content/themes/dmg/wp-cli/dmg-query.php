<?php 

/**
 *
 * Handles post querying between 2 dates else default last 30 days. filter by block name.
 *
 * @package DMG
 */

if ( ! defined( 'WP_CLI' ) || ! WP_CLI ) {
	return;
}

/**
 * Handles post querying.
 *
 * @var Class DMG_Query_Manager_WP_CLI
 */
class DMG_Query_Manager_WP_CLI extends WP_CLI_Command {

	/**
	 * Name of csv file to integrate.
	 *
	 * @var string $filename
	 */
	private string $filename;
 
	/**
	 * Array of tags loop through after collection from csv file.
	 *
	 * @var array $to_update
	 * */
	private array $to_update = array();

	/**
	 * This a dry run
	 *
	 * @var Boolean $dry_run
	 * */
	private bool $dry_run;

	/**
	 * Output result row
	 *
	 * @var array $output_row
	 * */
	private array $output_row = array();/**
    * Get all the posts between 2 dates else query the last 30 days. filter by block name.
    * 
    * ## OPTIONS
    *
    * [--dry-run]
    * : Perform a dry run.
    * 
    * [--output=<string>]
    * : Name of output report file.
    *
    * [--start-date=<string>]
    * : Start date for query. Format: YYYY-MM-DD.
    *
    * [--end-date=<string>]
    * : End date for query. Format: YYYY-MM-DD.
    * 
    * [--block-name=<string>]
    * : Name of the block to filter posts by.

    * @subcommand search
    */
    public function search( $args, $assoc_args ): void {

        $this->dry_run = $assoc_args['dry-run']    ?? false;
        $start_date    = $assoc_args['start-date'] ?? '';
        $end_date      = $assoc_args['end-date']   ?? '';
        $block_name      = $assoc_args['block-name']   ?? '';

        // not running  any uipdates so not required. force of habit defining.
        if ( $this->dry_run ) {
            \WP_CLI::Line( 'Dry run' );
        } 
         
        \WP_CLI::Line( "Running query with {$block_name} /' {$start_date} /  {$end_date}");

        // get the postIDs for the block name and date range if they exist
        $post_ids = $this->get_post_ids(
            $block_name,
            $start_date,
            $end_date
        );
        
        // output the post IDs
        if ( ! empty( $post_ids ) ) { 
            foreach( $post_ids as $post_id ) { 
                \WP_CLI::line( "{$post_id}"); 
            }
        } else {
            \WP_CLI::line( 'No posts found for the given criteria.' );
        }

    /**
     * WP CLI function to query posts on dates.
     *
     * @package DMG
     */

    function get_post_ids( $block_name = '', $start_date = '', $end_date = '' ) {

        // Normalize date inputs so handles if 1 or the other added in options
        if ( empty( $start_date ) ) {
            $start_date = current_time( 'Y-m-d' ); // default to today
        }

        // if end date is missing the we simply add 30 days to the start date
        if ( empty( $end_date ) ) {
            $end_date = date( 'Y-m-d', strtotime( '+30 days', strtotime( $start_date ) ) );
        }

        // Prepare the query arguments
        $args = [
            'post_type'      => 'post',
            'posts_per_page' => -1,
            'fields'         => 'ids', // Only return post IDs
            'date_query'     => [
                [
                    'after'     => $start_date,
                    'before'    => $end_date,
                    'inclusive' => true,
                ]
            ],
        ];

        $query = new WP_Query( $args );

        // If no block filtering, just return the post IDs
        if ( empty( $block_name ) ) {
            return $query->posts;
        }

        // Filter IDs by block presence
        $matched_ids = [];

        foreach ( $query->posts as $post_id ) {
            $blocks = parse_blocks( get_post_field( 'post_content', $post_id ) );

            foreach ( $blocks as $block ) {
                if ( $block['blockName'] === $block_name ) {
                    $matched_ids[] = $post_id;
                    break;
                }
            }
        }

        return $matched_ids;
    }



	/**
	 * Help.
	 */
	public static function help() {
		WP_CLI::line(
			<<<HELP
DMG Query Manager WP CLI. Collect posts between 2 dates or last 30 days and filter by block name.

Subcommand vars:

--block-name=<string>     Filter by block name (e.g. create-block/dmg-post-selector, core/paragraph, core/image, etc.)
--start-date=<date>       Start date in YYYY-MM-DD format (optional)
--end-date=<date>         End date in YYYY-MM-DD format (optional)
--dry-run                 Run the command without making any changes

All can be left empty. Any block name can be used ie create-block/dmg-post-selector, core/paragraph, core/image, core/heading etc.
HELP
		);
	}
}

WP_CLI::add_command( 'dmg-read-more', 'DMG_Query_Manager_WP_CLI' );