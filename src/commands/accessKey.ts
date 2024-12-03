import {
  SlashCommandBuilder,
  ChatInputCommandInteraction,
  GuildMember,
  Guild,
} from "discord.js";
import supabaseManager, { AccessKeyType } from "../utils/supabase.js";

interface AccessKeyCommandResult {
  success: boolean;
  roleId?: string;
  keyType?: AccessKeyType;
  remainingUses?: number;
}

export default {
  data: new SlashCommandBuilder()
    .setName("accesskey")
    .setDescription("Use an access key to get a role")
    .addStringOption((option) =>
      option
        .setName("key")
        .setDescription("Enter your access key")
        .setRequired(true)
    ),

  async execute(interaction: ChatInputCommandInteraction): Promise<void> {
    if (!interaction.isChatInputCommand()) return;

    const key = interaction.options.getString("key", true);
    const member = interaction.member as GuildMember;
    const guild = interaction.guild as Guild;

    if (!member || !guild) {
      await interaction.reply({
        content: "Unable to process your request.",
        ephemeral: true,
      });
      return;
    }

    try {
      const keyData = await supabaseManager.checkAccessKey(
        key,
        member.id,
        guild.id
      );

      if (!keyData?.valid) {
        await interaction.reply({
          content: "Invalid or already used access key.",
          ephemeral: true,
        });
        return;
      }

      const useResult = await supabaseManager.useAccessKey(
        key,
        member.id,
        guild.id
      );

      if (!useResult?.success) {
        await interaction.reply({
          content: "Failed to use access key.",
          ephemeral: true,
        });
        return;
      }

      const roleId = useResult.role_id;
      if (!roleId) {
        await interaction.reply({
          content: "No role ID found for this access key.",
          ephemeral: true,
        });
        return;
      }

      await member.roles.add(roleId);

      let responseMessage = "Role successfully added!";
      if (keyData.key_type === AccessKeyType.TimeLimited) {
        responseMessage += " This is a time-limited access.";
      } else if (keyData.key_type === AccessKeyType.MultiUse) {
        responseMessage += ` You have ${
          keyData.max_uses - keyData.current_uses - 1
        } uses remaining.`;
      }

      await interaction.reply({
        content: responseMessage,
        ephemeral: true,
      });
    } catch (error) {
      console.error("Error processing access key:", error);
      await interaction.reply({
        content: "An error occurred while processing your key.",
        ephemeral: true,
      });
    }
  },
};