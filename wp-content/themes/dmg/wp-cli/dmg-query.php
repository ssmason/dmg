<?php 

/**
 *
 * Handles post querying between 2 dates else default last 30 days.
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
    * Get all the posts between 2 dates else query the last 30 days
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

        if ( $this->dry_run ) {
            \WP_CLI::Line( 'Dry run' );
        } 
        \WP_CLI::Line( "Running query");
        
         
        \WP_CLI::Line( "Running query with {$block_name} /' {$start_date} /  {$end_date}");
        $post_ids = $this->get_post_ids(
            $block_name,
            $start_date,
            $end_date
        );
            
        print_r( $post_ids );
    }

    /**
     * WP CLI function to query posts on dates.
     *
     * @package DMG
     */

    function get_post_ids( $block_name = '', $start_date = '', $end_date = '' ) {

        if ( empty( $start_date ) || empty( $end_date ) ) {
            $end_date   = current_time( 'Y-m-d' );
            $start_date = date( 'Y-m-d', strtotime( '-30 days', strtotime( $end_date ) ) );
        }

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
usage: wp tag manager can be used to remove tags no londer required. Before the tags are deleted, a check if the tags are used in links in any posts and if they are then those links are removed. Following this, a redirect to the homes page is created for the terms that has been deleted as a README.md
HELP
		);
	}
}

WP_CLI::add_command( 'dmg-read-more', 'DMG_Query_Manager_WP_CLI' );