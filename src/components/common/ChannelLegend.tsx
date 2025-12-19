import React from "react";
import {
  CampaignChannel,
  CHANNEL_DOT_CLASS,
  CHANNEL_LABELS,
} from "@/styles/channelColors";

type ChannelLegendProps = {
  channels: CampaignChannel[];
  className?: string;
};

export const ChannelLegend: React.FC<ChannelLegendProps> = ({
  channels,
  className = "",
}) => {
  // de-dupe in case the array has repeats
  const uniqueChannels = Array.from(new Set(channels)) as CampaignChannel[];

  if (uniqueChannels.length === 0) return null;

  return (
    <div
      className={`mt-1 flex flex-wrap items-center gap-3 text-[11px] text-slate-500 ${className}`}
    >
      {uniqueChannels.map((channel) => (
        <span key={channel} className="inline-flex items-center gap-1.5">
          <span
            className={`h-1.5 w-1.5 rounded-full ${CHANNEL_DOT_CLASS[channel]}`}
          />
          <span>{CHANNEL_LABELS[channel]}</span>
        </span>
      ))}
    </div>
  );
};

export default ChannelLegend;
