import React from "react";
import ClicksBreakdownModal, {
  ClickTypeRow,
  ClicksBreakdownData,
} from "./ClicksBreakdownModal";

// Re-export types with campaign-specific naming for backward compatibility
export type CampaignClickTypeRow = ClickTypeRow;

export type CampaignClickBreakdown = {
  campaignId: string;
  campaignName: string;
  totalClicks: number;
  uniqueClickers: number;
  clickRate: number;
  unsubscribeRate: number;
  clickTypes: CampaignClickTypeRow[];
};

type CampaignClicksModalProps = {
  open: boolean;
  data: CampaignClickBreakdown | null;
  onClose: () => void;
};

const CampaignClicksModal: React.FC<CampaignClicksModalProps> = ({
  open,
  data,
  onClose,
}) => {
  if (!open || !data) return null;

  // Transform campaign data to generic ClicksBreakdownData
  const breakdownData: ClicksBreakdownData = {
    id: data.campaignId,
    name: data.campaignName,
    subtitle: "Click activity for this campaign's email drops.",
    totalClicks: data.totalClicks,
    clickTypes: data.clickTypes,
  };

  return (
    <ClicksBreakdownModal
      open={open}
      data={breakdownData}
      onClose={onClose}
    />
  );
};

export default CampaignClicksModal;
