import { MigrateUpArgs, MigrateDownArgs, sql } from '@payloadcms/db-sqlite'

export async function up({ db, payload, req }: MigrateUpArgs): Promise<void> {
  await db.run(sql`CREATE TABLE \`users_sessions\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`created_at\` text,
  	\`expires_at\` text NOT NULL,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`users_sessions_order_idx\` ON \`users_sessions\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`users_sessions_parent_id_idx\` ON \`users_sessions\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`users\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text NOT NULL,
  	\`role\` text DEFAULT 'member' NOT NULL,
  	\`mfa_enabled\` integer DEFAULT false,
  	\`mfa_secret\` text,
  	\`institution\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`enable_a_p_i_key\` integer,
  	\`api_key\` text,
  	\`api_key_index\` text,
  	\`email\` text NOT NULL,
  	\`reset_password_token\` text,
  	\`reset_password_expiration\` text,
  	\`salt\` text,
  	\`hash\` text,
  	\`_verified\` integer,
  	\`_verificationtoken\` text,
  	\`login_attempts\` numeric DEFAULT 0,
  	\`lock_until\` text
  );
  `)
  await db.run(sql`CREATE INDEX \`users_updated_at_idx\` ON \`users\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`users_created_at_idx\` ON \`users\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`users_email_idx\` ON \`users\` (\`email\`);`)
  await db.run(sql`CREATE TABLE \`collections_funder\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`name\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`collections\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`collections_funder_order_idx\` ON \`collections_funder\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`collections_funder_parent_id_idx\` ON \`collections_funder\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`collections\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`subtitle\` text,
  	\`description_short\` text,
  	\`description_long\` text,
  	\`region\` text,
  	\`period_start\` numeric,
  	\`period_end\` numeric,
  	\`status\` text DEFAULT 'active',
  	\`cover_asset_id\` integer,
  	\`og_image_asset_id\` integer,
  	\`sort_order\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`cover_asset_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`og_image_asset_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`collections_slug_idx\` ON \`collections\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`collections_cover_asset_idx\` ON \`collections\` (\`cover_asset_id\`);`)
  await db.run(sql`CREATE INDEX \`collections_og_image_asset_idx\` ON \`collections\` (\`og_image_asset_id\`);`)
  await db.run(sql`CREATE INDEX \`collections_updated_at_idx\` ON \`collections\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`collections_created_at_idx\` ON \`collections\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`collections__status_idx\` ON \`collections\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_collections_v_version_funder\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_collections_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_collections_v_version_funder_order_idx\` ON \`_collections_v_version_funder\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_version_funder_parent_id_idx\` ON \`_collections_v_version_funder\` (\`_parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_collections_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_subtitle\` text,
  	\`version_description_short\` text,
  	\`version_description_long\` text,
  	\`version_region\` text,
  	\`version_period_start\` numeric,
  	\`version_period_end\` numeric,
  	\`version_status\` text DEFAULT 'active',
  	\`version_cover_asset_id\` integer,
  	\`version_og_image_asset_id\` integer,
  	\`version_sort_order\` numeric,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`collections\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_cover_asset_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_og_image_asset_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_collections_v_parent_idx\` ON \`_collections_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_version_version_slug_idx\` ON \`_collections_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_version_version_cover_asset_idx\` ON \`_collections_v\` (\`version_cover_asset_id\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_version_version_og_image_asset_idx\` ON \`_collections_v\` (\`version_og_image_asset_id\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_version_version_updated_at_idx\` ON \`_collections_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_version_version_created_at_idx\` ON \`_collections_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_version_version__status_idx\` ON \`_collections_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_created_at_idx\` ON \`_collections_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_updated_at_idx\` ON \`_collections_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_collections_v_latest_idx\` ON \`_collections_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`archive_items_language\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`archive_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`archive_items_language_order_idx\` ON \`archive_items_language\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_language_parent_idx\` ON \`archive_items_language\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`archive_items_contributors\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` text PRIMARY KEY NOT NULL,
  	\`narasumber_id\` integer,
  	\`role\` text,
  	FOREIGN KEY (\`narasumber_id\`) REFERENCES \`narasumber\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`archive_items\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`archive_items_contributors_order_idx\` ON \`archive_items_contributors\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_contributors_parent_id_idx\` ON \`archive_items_contributors\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_contributors_narasumber_idx\` ON \`archive_items_contributors\` (\`narasumber_id\`);`)
  await db.run(sql`CREATE TABLE \`archive_items\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`archive_number\` text,
  	\`title\` text,
  	\`slug\` text,
  	\`collection_id\` integer,
  	\`summary\` text,
  	\`description\` text,
  	\`video_source\` text DEFAULT 'none',
  	\`youtube_id\` text,
  	\`thumbnail_url\` text,
  	\`youtube_privacy\` text DEFAULT 'public',
  	\`internal_asset_id\` integer,
  	\`fallback_mp4\` text,
  	\`duration_seconds\` numeric,
  	\`recorded_at\` text,
  	\`recorded_place\` text,
  	\`access_tier\` text DEFAULT 'public',
  	\`embargo_until\` text,
  	\`rights_statement\` text,
  	\`license\` text DEFAULT 'CC BY-NC-ND 4.0',
  	\`consent_ref\` text,
  	\`consent_verified\` integer DEFAULT false,
  	\`withdrawal_requested\` integer DEFAULT false,
  	\`location_id\` integer,
  	\`featured\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`collection_id\`) REFERENCES \`collections\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`internal_asset_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`archive_items_archive_number_idx\` ON \`archive_items\` (\`archive_number\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`archive_items_slug_idx\` ON \`archive_items\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_collection_idx\` ON \`archive_items\` (\`collection_id\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_internal_asset_idx\` ON \`archive_items\` (\`internal_asset_id\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_location_idx\` ON \`archive_items\` (\`location_id\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_updated_at_idx\` ON \`archive_items\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_created_at_idx\` ON \`archive_items\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`archive_items__status_idx\` ON \`archive_items\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`archive_items_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`themes_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`archive_items\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`themes_id\`) REFERENCES \`themes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`archive_items_rels_order_idx\` ON \`archive_items_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_rels_parent_idx\` ON \`archive_items_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_rels_path_idx\` ON \`archive_items_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`archive_items_rels_themes_id_idx\` ON \`archive_items_rels\` (\`themes_id\`);`)
  await db.run(sql`CREATE TABLE \`_archive_items_v_version_language\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_archive_items_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_language_order_idx\` ON \`_archive_items_v_version_language\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_language_parent_idx\` ON \`_archive_items_v_version_language\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_archive_items_v_version_contributors\` (
  	\`_order\` integer NOT NULL,
  	\`_parent_id\` integer NOT NULL,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`narasumber_id\` integer,
  	\`role\` text,
  	\`_uuid\` text,
  	FOREIGN KEY (\`narasumber_id\`) REFERENCES \`narasumber\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`_parent_id\`) REFERENCES \`_archive_items_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_contributors_order_idx\` ON \`_archive_items_v_version_contributors\` (\`_order\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_contributors_parent_id_idx\` ON \`_archive_items_v_version_contributors\` (\`_parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_contributors_narasumber_idx\` ON \`_archive_items_v_version_contributors\` (\`narasumber_id\`);`)
  await db.run(sql`CREATE TABLE \`_archive_items_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_archive_number\` text,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_collection_id\` integer,
  	\`version_summary\` text,
  	\`version_description\` text,
  	\`version_video_source\` text DEFAULT 'none',
  	\`version_youtube_id\` text,
  	\`version_thumbnail_url\` text,
  	\`version_youtube_privacy\` text DEFAULT 'public',
  	\`version_internal_asset_id\` integer,
  	\`version_fallback_mp4\` text,
  	\`version_duration_seconds\` numeric,
  	\`version_recorded_at\` text,
  	\`version_recorded_place\` text,
  	\`version_access_tier\` text DEFAULT 'public',
  	\`version_embargo_until\` text,
  	\`version_rights_statement\` text,
  	\`version_license\` text DEFAULT 'CC BY-NC-ND 4.0',
  	\`version_consent_ref\` text,
  	\`version_consent_verified\` integer DEFAULT false,
  	\`version_withdrawal_requested\` integer DEFAULT false,
  	\`version_location_id\` integer,
  	\`version_featured\` integer DEFAULT false,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`archive_items\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_collection_id\`) REFERENCES \`collections\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_internal_asset_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_archive_items_v_parent_idx\` ON \`_archive_items_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version_archive_number_idx\` ON \`_archive_items_v\` (\`version_archive_number\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version_slug_idx\` ON \`_archive_items_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version_collection_idx\` ON \`_archive_items_v\` (\`version_collection_id\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version_internal_asset_idx\` ON \`_archive_items_v\` (\`version_internal_asset_id\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version_location_idx\` ON \`_archive_items_v\` (\`version_location_id\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version_updated_at_idx\` ON \`_archive_items_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version_created_at_idx\` ON \`_archive_items_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_version_version__status_idx\` ON \`_archive_items_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_created_at_idx\` ON \`_archive_items_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_updated_at_idx\` ON \`_archive_items_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_latest_idx\` ON \`_archive_items_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`_archive_items_v_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`themes_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_archive_items_v\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`themes_id\`) REFERENCES \`themes\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_archive_items_v_rels_order_idx\` ON \`_archive_items_v_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_rels_parent_idx\` ON \`_archive_items_v_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_rels_path_idx\` ON \`_archive_items_v_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`_archive_items_v_rels_themes_id_idx\` ON \`_archive_items_v_rels\` (\`themes_id\`);`)
  await db.run(sql`CREATE TABLE \`assets\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`archive_item_id\` integer,
  	\`kind\` text NOT NULL,
  	\`tier\` text DEFAULT 'public' NOT NULL,
  	\`storage_bucket\` text NOT NULL,
  	\`storage_key\` text NOT NULL,
  	\`file_size_bytes\` numeric,
  	\`duration_seconds\` numeric,
  	\`alt_text\` text,
  	\`caption\` text,
  	\`checksum_sha256\` text,
  	\`is_original_master\` integer DEFAULT false,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`url\` text,
  	\`thumbnail_u_r_l\` text,
  	\`filename\` text,
  	\`mime_type\` text,
  	\`filesize\` numeric,
  	\`width\` numeric,
  	\`height\` numeric,
  	\`focal_x\` numeric,
  	\`focal_y\` numeric,
  	FOREIGN KEY (\`archive_item_id\`) REFERENCES \`archive_items\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`assets_archive_item_idx\` ON \`assets\` (\`archive_item_id\`);`)
  await db.run(sql`CREATE INDEX \`assets_updated_at_idx\` ON \`assets\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`assets_created_at_idx\` ON \`assets\` (\`created_at\`);`)
  await db.run(sql`CREATE UNIQUE INDEX \`assets_filename_idx\` ON \`assets\` (\`filename\`);`)
  await db.run(sql`CREATE TABLE \`transcripts\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`archive_item_id\` integer NOT NULL,
  	\`language\` text DEFAULT 'id' NOT NULL,
  	\`format\` text DEFAULT 'timecoded' NOT NULL,
  	\`body\` text NOT NULL,
  	\`segments\` text,
  	\`is_verified\` integer DEFAULT false,
  	\`visibility\` text DEFAULT 'public' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`archive_item_id\`) REFERENCES \`archive_items\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`transcripts_archive_item_idx\` ON \`transcripts\` (\`archive_item_id\`);`)
  await db.run(sql`CREATE INDEX \`transcripts_updated_at_idx\` ON \`transcripts\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`transcripts_created_at_idx\` ON \`transcripts\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`narasumber_role_tags\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`narasumber\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`narasumber_role_tags_order_idx\` ON \`narasumber_role_tags\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`narasumber_role_tags_parent_idx\` ON \`narasumber_role_tags\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`narasumber\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`display_name\` text,
  	\`initials\` text,
  	\`slug\` text,
  	\`honorific\` text,
  	\`bio_short\` text,
  	\`bio_long\` text,
  	\`birth_year\` numeric,
  	\`location_id\` integer,
  	\`is_deceased\` integer DEFAULT false,
  	\`deceased_year\` numeric,
  	\`display_consent\` text DEFAULT 'full_name',
  	\`contact_via_platform_only\` integer DEFAULT true,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft',
  	FOREIGN KEY (\`location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`narasumber_slug_idx\` ON \`narasumber\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`narasumber_location_idx\` ON \`narasumber\` (\`location_id\`);`)
  await db.run(sql`CREATE INDEX \`narasumber_updated_at_idx\` ON \`narasumber\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`narasumber_created_at_idx\` ON \`narasumber\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`narasumber__status_idx\` ON \`narasumber\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_narasumber_v_version_role_tags\` (
  	\`order\` integer NOT NULL,
  	\`parent_id\` integer NOT NULL,
  	\`value\` text,
  	\`id\` integer PRIMARY KEY NOT NULL,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`_narasumber_v\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`_narasumber_v_version_role_tags_order_idx\` ON \`_narasumber_v_version_role_tags\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_version_role_tags_parent_idx\` ON \`_narasumber_v_version_role_tags\` (\`parent_id\`);`)
  await db.run(sql`CREATE TABLE \`_narasumber_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_display_name\` text,
  	\`version_initials\` text,
  	\`version_slug\` text,
  	\`version_honorific\` text,
  	\`version_bio_short\` text,
  	\`version_bio_long\` text,
  	\`version_birth_year\` numeric,
  	\`version_location_id\` integer,
  	\`version_is_deceased\` integer DEFAULT false,
  	\`version_deceased_year\` numeric,
  	\`version_display_consent\` text DEFAULT 'full_name',
  	\`version_contact_via_platform_only\` integer DEFAULT true,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`narasumber\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`version_location_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_narasumber_v_parent_idx\` ON \`_narasumber_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_version_version_slug_idx\` ON \`_narasumber_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_version_version_location_idx\` ON \`_narasumber_v\` (\`version_location_id\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_version_version_updated_at_idx\` ON \`_narasumber_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_version_version_created_at_idx\` ON \`_narasumber_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_version_version__status_idx\` ON \`_narasumber_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_created_at_idx\` ON \`_narasumber_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_updated_at_idx\` ON \`_narasumber_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_narasumber_v_latest_idx\` ON \`_narasumber_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`stories\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`stories_slug_idx\` ON \`stories\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`stories_updated_at_idx\` ON \`stories\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`stories_created_at_idx\` ON \`stories\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`stories__status_idx\` ON \`stories\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_stories_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`stories\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_stories_v_parent_idx\` ON \`_stories_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_stories_v_version_version_slug_idx\` ON \`_stories_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_stories_v_version_version_updated_at_idx\` ON \`_stories_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_stories_v_version_version_created_at_idx\` ON \`_stories_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_stories_v_version_version__status_idx\` ON \`_stories_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_stories_v_created_at_idx\` ON \`_stories_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_stories_v_updated_at_idx\` ON \`_stories_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_stories_v_latest_idx\` ON \`_stories_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`batik_businesses\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`batik_businesses_slug_idx\` ON \`batik_businesses\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`batik_businesses_updated_at_idx\` ON \`batik_businesses\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`batik_businesses_created_at_idx\` ON \`batik_businesses\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`batik_businesses__status_idx\` ON \`batik_businesses\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_batik_businesses_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`batik_businesses\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_parent_idx\` ON \`_batik_businesses_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_version_version_slug_idx\` ON \`_batik_businesses_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_version_version_updated_at_idx\` ON \`_batik_businesses_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_version_version_created_at_idx\` ON \`_batik_businesses_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_version_version__status_idx\` ON \`_batik_businesses_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_created_at_idx\` ON \`_batik_businesses_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_updated_at_idx\` ON \`_batik_businesses_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_batik_businesses_v_latest_idx\` ON \`_batik_businesses_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`themes\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`themes_slug_idx\` ON \`themes\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`themes_updated_at_idx\` ON \`themes\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`themes_created_at_idx\` ON \`themes\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`themes__status_idx\` ON \`themes\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_themes_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`themes\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_themes_v_parent_idx\` ON \`_themes_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_themes_v_version_version_slug_idx\` ON \`_themes_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_themes_v_version_version_updated_at_idx\` ON \`_themes_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_themes_v_version_version_created_at_idx\` ON \`_themes_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_themes_v_version_version__status_idx\` ON \`_themes_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_themes_v_created_at_idx\` ON \`_themes_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_themes_v_updated_at_idx\` ON \`_themes_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_themes_v_latest_idx\` ON \`_themes_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`locations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`locations_slug_idx\` ON \`locations\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`locations_updated_at_idx\` ON \`locations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`locations_created_at_idx\` ON \`locations\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`locations__status_idx\` ON \`locations\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_locations_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_locations_v_parent_idx\` ON \`_locations_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_locations_v_version_version_slug_idx\` ON \`_locations_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_locations_v_version_version_updated_at_idx\` ON \`_locations_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_locations_v_version_version_created_at_idx\` ON \`_locations_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_locations_v_version_version__status_idx\` ON \`_locations_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_locations_v_created_at_idx\` ON \`_locations_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_locations_v_updated_at_idx\` ON \`_locations_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_locations_v_latest_idx\` ON \`_locations_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`timeline_events\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`timeline_events_slug_idx\` ON \`timeline_events\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`timeline_events_updated_at_idx\` ON \`timeline_events\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`timeline_events_created_at_idx\` ON \`timeline_events\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`timeline_events__status_idx\` ON \`timeline_events\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_timeline_events_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`timeline_events\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_parent_idx\` ON \`_timeline_events_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_version_version_slug_idx\` ON \`_timeline_events_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_version_version_updated_at_idx\` ON \`_timeline_events_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_version_version_created_at_idx\` ON \`_timeline_events_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_version_version__status_idx\` ON \`_timeline_events_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_created_at_idx\` ON \`_timeline_events_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_updated_at_idx\` ON \`_timeline_events_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_timeline_events_v_latest_idx\` ON \`_timeline_events_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`color_map_entries\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`color_map_entries_slug_idx\` ON \`color_map_entries\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`color_map_entries_updated_at_idx\` ON \`color_map_entries\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`color_map_entries_created_at_idx\` ON \`color_map_entries\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`color_map_entries__status_idx\` ON \`color_map_entries\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_color_map_entries_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`color_map_entries\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_parent_idx\` ON \`_color_map_entries_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_version_version_slug_idx\` ON \`_color_map_entries_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_version_version_updated_at_idx\` ON \`_color_map_entries_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_version_version_created_at_idx\` ON \`_color_map_entries_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_version_version__status_idx\` ON \`_color_map_entries_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_created_at_idx\` ON \`_color_map_entries_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_updated_at_idx\` ON \`_color_map_entries_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_color_map_entries_v_latest_idx\` ON \`_color_map_entries_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`access_requests\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`title\` text,
  	\`slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`_status\` text DEFAULT 'draft'
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`access_requests_slug_idx\` ON \`access_requests\` (\`slug\`);`)
  await db.run(sql`CREATE INDEX \`access_requests_updated_at_idx\` ON \`access_requests\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`access_requests_created_at_idx\` ON \`access_requests\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`access_requests__status_idx\` ON \`access_requests\` (\`_status\`);`)
  await db.run(sql`CREATE TABLE \`_access_requests_v\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`parent_id\` integer,
  	\`version_title\` text,
  	\`version_slug\` text,
  	\`version_updated_at\` text,
  	\`version_created_at\` text,
  	\`version__status\` text DEFAULT 'draft',
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`latest\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`access_requests\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`_access_requests_v_parent_idx\` ON \`_access_requests_v\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`_access_requests_v_version_version_slug_idx\` ON \`_access_requests_v\` (\`version_slug\`);`)
  await db.run(sql`CREATE INDEX \`_access_requests_v_version_version_updated_at_idx\` ON \`_access_requests_v\` (\`version_updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_access_requests_v_version_version_created_at_idx\` ON \`_access_requests_v\` (\`version_created_at\`);`)
  await db.run(sql`CREATE INDEX \`_access_requests_v_version_version__status_idx\` ON \`_access_requests_v\` (\`version__status\`);`)
  await db.run(sql`CREATE INDEX \`_access_requests_v_created_at_idx\` ON \`_access_requests_v\` (\`created_at\`);`)
  await db.run(sql`CREATE INDEX \`_access_requests_v_updated_at_idx\` ON \`_access_requests_v\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`_access_requests_v_latest_idx\` ON \`_access_requests_v\` (\`latest\`);`)
  await db.run(sql`CREATE TABLE \`access_grants\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`access_request_id\` integer NOT NULL,
  	\`user_id\` integer NOT NULL,
  	\`scope_type\` text NOT NULL,
  	\`scope_id\` text NOT NULL,
  	\`granted_at\` text NOT NULL,
  	\`expires_at\` text NOT NULL,
  	\`revoked_at\` text,
  	\`revoke_reason\` text,
  	\`max_downloads\` numeric DEFAULT 20,
  	\`download_count\` numeric DEFAULT 0,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`access_request_id\`) REFERENCES \`access_requests\`(\`id\`) ON UPDATE no action ON DELETE set null,
  	FOREIGN KEY (\`user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`access_grants_access_request_idx\` ON \`access_grants\` (\`access_request_id\`);`)
  await db.run(sql`CREATE INDEX \`access_grants_user_idx\` ON \`access_grants\` (\`user_id\`);`)
  await db.run(sql`CREATE INDEX \`access_grants_updated_at_idx\` ON \`access_grants\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`access_grants_created_at_idx\` ON \`access_grants\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`audit_logs\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`occurred_at\` text NOT NULL,
  	\`actor_user_id\` integer,
  	\`actor_hash\` text,
  	\`event_type\` text NOT NULL,
  	\`target_type\` text,
  	\`target_id\` text,
  	\`metadata\` text,
  	\`retention_class\` text DEFAULT 'short' NOT NULL,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	FOREIGN KEY (\`actor_user_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE set null
  );
  `)
  await db.run(sql`CREATE INDEX \`audit_logs_occurred_at_idx\` ON \`audit_logs\` (\`occurred_at\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_actor_user_idx\` ON \`audit_logs\` (\`actor_user_id\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_event_type_idx\` ON \`audit_logs\` (\`event_type\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_updated_at_idx\` ON \`audit_logs\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`audit_logs_created_at_idx\` ON \`audit_logs\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_kv\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text NOT NULL,
  	\`data\` text NOT NULL
  );
  `)
  await db.run(sql`CREATE UNIQUE INDEX \`payload_kv_key_idx\` ON \`payload_kv\` (\`key\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`global_slug\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_global_slug_idx\` ON \`payload_locked_documents\` (\`global_slug\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_updated_at_idx\` ON \`payload_locked_documents\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_created_at_idx\` ON \`payload_locked_documents\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_locked_documents_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	\`collections_id\` integer,
  	\`archive_items_id\` integer,
  	\`assets_id\` integer,
  	\`transcripts_id\` integer,
  	\`narasumber_id\` integer,
  	\`stories_id\` integer,
  	\`batik_businesses_id\` integer,
  	\`themes_id\` integer,
  	\`locations_id\` integer,
  	\`timeline_events_id\` integer,
  	\`color_map_entries_id\` integer,
  	\`access_requests_id\` integer,
  	\`access_grants_id\` integer,
  	\`audit_logs_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_locked_documents\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`collections_id\`) REFERENCES \`collections\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`archive_items_id\`) REFERENCES \`archive_items\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`assets_id\`) REFERENCES \`assets\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`transcripts_id\`) REFERENCES \`transcripts\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`narasumber_id\`) REFERENCES \`narasumber\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`stories_id\`) REFERENCES \`stories\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`batik_businesses_id\`) REFERENCES \`batik_businesses\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`themes_id\`) REFERENCES \`themes\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`locations_id\`) REFERENCES \`locations\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`timeline_events_id\`) REFERENCES \`timeline_events\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`color_map_entries_id\`) REFERENCES \`color_map_entries\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`access_requests_id\`) REFERENCES \`access_requests\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`access_grants_id\`) REFERENCES \`access_grants\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`audit_logs_id\`) REFERENCES \`audit_logs\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_order_idx\` ON \`payload_locked_documents_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_parent_idx\` ON \`payload_locked_documents_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_path_idx\` ON \`payload_locked_documents_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_users_id_idx\` ON \`payload_locked_documents_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_collections_id_idx\` ON \`payload_locked_documents_rels\` (\`collections_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_archive_items_id_idx\` ON \`payload_locked_documents_rels\` (\`archive_items_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_assets_id_idx\` ON \`payload_locked_documents_rels\` (\`assets_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_transcripts_id_idx\` ON \`payload_locked_documents_rels\` (\`transcripts_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_narasumber_id_idx\` ON \`payload_locked_documents_rels\` (\`narasumber_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_stories_id_idx\` ON \`payload_locked_documents_rels\` (\`stories_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_batik_businesses_id_idx\` ON \`payload_locked_documents_rels\` (\`batik_businesses_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_themes_id_idx\` ON \`payload_locked_documents_rels\` (\`themes_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_locations_id_idx\` ON \`payload_locked_documents_rels\` (\`locations_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_timeline_events_id_idx\` ON \`payload_locked_documents_rels\` (\`timeline_events_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_color_map_entries_id_idx\` ON \`payload_locked_documents_rels\` (\`color_map_entries_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_access_requests_id_idx\` ON \`payload_locked_documents_rels\` (\`access_requests_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_access_grants_id_idx\` ON \`payload_locked_documents_rels\` (\`access_grants_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_locked_documents_rels_audit_logs_id_idx\` ON \`payload_locked_documents_rels\` (\`audit_logs_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`key\` text,
  	\`value\` text,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_key_idx\` ON \`payload_preferences\` (\`key\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_updated_at_idx\` ON \`payload_preferences\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_created_at_idx\` ON \`payload_preferences\` (\`created_at\`);`)
  await db.run(sql`CREATE TABLE \`payload_preferences_rels\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`order\` integer,
  	\`parent_id\` integer NOT NULL,
  	\`path\` text NOT NULL,
  	\`users_id\` integer,
  	FOREIGN KEY (\`parent_id\`) REFERENCES \`payload_preferences\`(\`id\`) ON UPDATE no action ON DELETE cascade,
  	FOREIGN KEY (\`users_id\`) REFERENCES \`users\`(\`id\`) ON UPDATE no action ON DELETE cascade
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_order_idx\` ON \`payload_preferences_rels\` (\`order\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_parent_idx\` ON \`payload_preferences_rels\` (\`parent_id\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_path_idx\` ON \`payload_preferences_rels\` (\`path\`);`)
  await db.run(sql`CREATE INDEX \`payload_preferences_rels_users_id_idx\` ON \`payload_preferences_rels\` (\`users_id\`);`)
  await db.run(sql`CREATE TABLE \`payload_migrations\` (
  	\`id\` integer PRIMARY KEY NOT NULL,
  	\`name\` text,
  	\`batch\` numeric,
  	\`updated_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL,
  	\`created_at\` text DEFAULT (strftime('%Y-%m-%dT%H:%M:%fZ', 'now')) NOT NULL
  );
  `)
  await db.run(sql`CREATE INDEX \`payload_migrations_updated_at_idx\` ON \`payload_migrations\` (\`updated_at\`);`)
  await db.run(sql`CREATE INDEX \`payload_migrations_created_at_idx\` ON \`payload_migrations\` (\`created_at\`);`)
}

export async function down({ db, payload, req }: MigrateDownArgs): Promise<void> {
  await db.run(sql`DROP TABLE \`users_sessions\`;`)
  await db.run(sql`DROP TABLE \`users\`;`)
  await db.run(sql`DROP TABLE \`collections_funder\`;`)
  await db.run(sql`DROP TABLE \`collections\`;`)
  await db.run(sql`DROP TABLE \`_collections_v_version_funder\`;`)
  await db.run(sql`DROP TABLE \`_collections_v\`;`)
  await db.run(sql`DROP TABLE \`archive_items_language\`;`)
  await db.run(sql`DROP TABLE \`archive_items_contributors\`;`)
  await db.run(sql`DROP TABLE \`archive_items\`;`)
  await db.run(sql`DROP TABLE \`archive_items_rels\`;`)
  await db.run(sql`DROP TABLE \`_archive_items_v_version_language\`;`)
  await db.run(sql`DROP TABLE \`_archive_items_v_version_contributors\`;`)
  await db.run(sql`DROP TABLE \`_archive_items_v\`;`)
  await db.run(sql`DROP TABLE \`_archive_items_v_rels\`;`)
  await db.run(sql`DROP TABLE \`assets\`;`)
  await db.run(sql`DROP TABLE \`transcripts\`;`)
  await db.run(sql`DROP TABLE \`narasumber_role_tags\`;`)
  await db.run(sql`DROP TABLE \`narasumber\`;`)
  await db.run(sql`DROP TABLE \`_narasumber_v_version_role_tags\`;`)
  await db.run(sql`DROP TABLE \`_narasumber_v\`;`)
  await db.run(sql`DROP TABLE \`stories\`;`)
  await db.run(sql`DROP TABLE \`_stories_v\`;`)
  await db.run(sql`DROP TABLE \`batik_businesses\`;`)
  await db.run(sql`DROP TABLE \`_batik_businesses_v\`;`)
  await db.run(sql`DROP TABLE \`themes\`;`)
  await db.run(sql`DROP TABLE \`_themes_v\`;`)
  await db.run(sql`DROP TABLE \`locations\`;`)
  await db.run(sql`DROP TABLE \`_locations_v\`;`)
  await db.run(sql`DROP TABLE \`timeline_events\`;`)
  await db.run(sql`DROP TABLE \`_timeline_events_v\`;`)
  await db.run(sql`DROP TABLE \`color_map_entries\`;`)
  await db.run(sql`DROP TABLE \`_color_map_entries_v\`;`)
  await db.run(sql`DROP TABLE \`access_requests\`;`)
  await db.run(sql`DROP TABLE \`_access_requests_v\`;`)
  await db.run(sql`DROP TABLE \`access_grants\`;`)
  await db.run(sql`DROP TABLE \`audit_logs\`;`)
  await db.run(sql`DROP TABLE \`payload_kv\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents\`;`)
  await db.run(sql`DROP TABLE \`payload_locked_documents_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences\`;`)
  await db.run(sql`DROP TABLE \`payload_preferences_rels\`;`)
  await db.run(sql`DROP TABLE \`payload_migrations\`;`)
}
