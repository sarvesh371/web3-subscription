export type Json = string | number | boolean | null | { [key: string]: Json | undefined } | Json[];

export type Database = {
	graphql_public: {
		Tables: {
			[_ in never]: never;

			
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			graphql: {
				Args: {
					operationName?: string;
					query?: string;
					variables?: Json;
					extensions?: Json;
				};
				Returns: Json;
			};
		};
		Enums: {
			[_ in never]: never;
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
	public: {
		Tables: {
			access_keys: {
				Row: {
					created_at: string | null;
					created_by: string;
					current_uses: number | null;
					guild_id: string;
					id: string;
					key: string;
					key_type: "aead-ietf" | "aead-det" | "hmacsha512" | "hmacsha256" | "auth" | "shorthash" | "generichash" | "kdf" | "secretbox" | "secretstream" | "stream_xchacha20";
					max_uses: number | null;
					role_id: string;
					valid_from: string | null;
					valid_until: string | null;
				};
				Insert: {
					created_at?: string | null;
					created_by: string;
					current_uses?: number | null;
					guild_id: string;
					id?: string;
					key: string;
					key_type?: "aead-ietf" | "aead-det" | "hmacsha512" | "hmacsha256" | "auth" | "shorthash" | "generichash" | "kdf" | "secretbox" | "secretstream" | "stream_xchacha20";
					max_uses?: number | null;
					role_id: string;
					valid_from?: string | null;
					valid_until?: string | null;
				};
				Update: {
					created_at?: string | null;
					created_by?: string;
					current_uses?: number | null;
					guild_id?: string;
					id?: string;
					key?: string;
					key_type?: "aead-ietf" | "aead-det" | "hmacsha512" | "hmacsha256" | "auth" | "shorthash" | "generichash" | "kdf" | "secretbox" | "secretstream" | "stream_xchacha20";
					max_uses?: number | null;
					role_id?: string;
					valid_from?: string | null;
					valid_until?: string | null;
				};
				Relationships: [];
			};
			Community: {
				Row: {
					admin_id: number | null;
					created_at: string;
					description: string | null;
					id: number;
					morderator: number[] | null;
					profile_url: string | null;
					subscribers: Json | null;
					tiers: number[] | null;
				};
				Insert: {
					admin_id?: number | null;
					created_at?: string;
					description?: string | null;
					id?: number;
					morderator?: number[] | null;
					profile_url?: string | null;
					subscribers?: Json | null;
					tiers?: number[] | null;
				};
				Update: {
					admin_id?: number | null;
					created_at?: string;
					description?: string | null;
					id?: number;
					morderator?: number[] | null;
					profile_url?: string | null;
					subscribers?: Json | null;
					tiers?: number[] | null;
				};
				Relationships: [];
			};
			subscriptions: {
				Row: {
					amount_paid: number;
					buyer_wallet: string;
					created_at: string | null;
					end_date: string;
					start_date: string;
					subscription_id: number;
					subscription_purchase_id: number;
				};
				Insert: {
					amount_paid: number;
					buyer_wallet: string;
					created_at?: string | null;
					end_date: string;
					start_date: string;
					subscription_id: number;
					subscription_purchase_id?: number;
				};
				Update: {
					amount_paid?: number;
					buyer_wallet?: string;
					created_at?: string | null;
					end_date?: string;
					start_date?: string;
					subscription_id?: number;
					subscription_purchase_id?: number;
				};
				Relationships: [];
			};
			subscriptions_list: {
				Row: {
					already_bought: number | null;
					amount: number;
					created_at: string | null;
					currency: string;
					details: string | null;
					lister_wallet: string;
					name: string;
					period: number;
					status: string;
					subscription_id: number;
				};
				Insert: {
					already_bought?: number | null;
					amount: number;
					created_at?: string | null;
					currency: string;
					details?: string | null;
					lister_wallet: string;
					name: string;
					period: number;
					status: string;
					subscription_id?: number;
				};
				Update: {
					already_bought?: number | null;
					amount?: number;
					created_at?: string | null;
					currency?: string;
					details?: string | null;
					lister_wallet?: string;
					name?: string;
					period?: number;
					status?: string;
					subscription_id?: number;
				};
				Relationships: [];
			};
			used_keys: {
				Row: {
					guild_id: string;
					id: string;
					key_id: string | null;
					used_at: string | null;
					user_id: string;
				};
				Insert: {
					guild_id: string;
					id?: string;
					key_id?: string | null;
					used_at?: string | null;
					user_id: string;
				};
				Update: {
					guild_id?: string;
					id?: string;
					key_id?: string | null;
					used_at?: string | null;
					user_id?: string;
				};
				Relationships: [
					{
						foreignKeyName: "used_keys_key_id_fkey";
						columns: ["key_id"];
						isOneToOne: false;
						referencedRelation: "access_keys";
						referencedColumns: ["id"];
					},
				];
			};
		};
		Views: {
			[_ in never]: never;
		};
		Functions: {
			check_access_key:
				| {
						Args: {
							input_key: string;
						};
						Returns: {
							valid: boolean;
							role_id: string;
							guild_id: string;
						}[];
				  }
				| {
						Args: {
							input_key: string;
							input_user_id: string;
							input_guild_id: string;
						};
						Returns: {
							valid: boolean;
							role_id: string;
							key_type: string;
							max_uses: number;
							current_uses: number;
						}[];
				  };
			use_access_key: {
				Args: {
					input_key: string;
					input_user_id: string;
					input_guild_id: string;
				};
				Returns: {
					success: boolean;
					role_id: string;
				}[];
			};
		};
		Enums: {
			key_type: "single_use" | "time_limited" | "multi_use";
		};
		CompositeTypes: {
			[_ in never]: never;
		};
	};
};

type PublicSchema = Database[Extract<keyof Database, "public">];

export type Tables<
	PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"]) | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database }
		? keyof (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"])
		: never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? (Database[PublicTableNameOrOptions["schema"]]["Tables"] & Database[PublicTableNameOrOptions["schema"]]["Views"])[TableName] extends {
			Row: infer R;
	  }
		? R
		: never
	: PublicTableNameOrOptions extends keyof (PublicSchema["Tables"] & PublicSchema["Views"])
	? (PublicSchema["Tables"] & PublicSchema["Views"])[PublicTableNameOrOptions] extends {
			Row: infer R;
	  }
		? R
		: never
	: never;

export type TablesInsert<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"] : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Insert: infer I;
	  }
		? I
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
	? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Insert: infer I;
	  }
		? I
		: never
	: never;

export type TablesUpdate<
	PublicTableNameOrOptions extends keyof PublicSchema["Tables"] | { schema: keyof Database },
	TableName extends PublicTableNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicTableNameOrOptions["schema"]]["Tables"] : never = never,
> = PublicTableNameOrOptions extends { schema: keyof Database }
	? Database[PublicTableNameOrOptions["schema"]]["Tables"][TableName] extends {
			Update: infer U;
	  }
		? U
		: never
	: PublicTableNameOrOptions extends keyof PublicSchema["Tables"]
	? PublicSchema["Tables"][PublicTableNameOrOptions] extends {
			Update: infer U;
	  }
		? U
		: never
	: never;

export type Enums<
	PublicEnumNameOrOptions extends keyof PublicSchema["Enums"] | { schema: keyof Database },
	EnumName extends PublicEnumNameOrOptions extends { schema: keyof Database } ? keyof Database[PublicEnumNameOrOptions["schema"]]["Enums"] : never = never,
> = PublicEnumNameOrOptions extends { schema: keyof Database }
	? Database[PublicEnumNameOrOptions["schema"]]["Enums"][EnumName]
	: PublicEnumNameOrOptions extends keyof PublicSchema["Enums"]
	? PublicSchema["Enums"][PublicEnumNameOrOptions]
	: never;

export type CompositeTypes<
	PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"] | { schema: keyof Database },
	CompositeTypeName extends PublicCompositeTypeNameOrOptions extends {
		schema: keyof Database;
	}
		? keyof Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"]
		: never = never,
> = PublicCompositeTypeNameOrOptions extends { schema: keyof Database }
	? Database[PublicCompositeTypeNameOrOptions["schema"]]["CompositeTypes"][CompositeTypeName]
	: PublicCompositeTypeNameOrOptions extends keyof PublicSchema["CompositeTypes"]
	? PublicSchema["CompositeTypes"][PublicCompositeTypeNameOrOptions]
	: never;
