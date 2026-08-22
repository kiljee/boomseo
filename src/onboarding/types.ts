export type Props = {
  onContinue: () => void;
  onBack: () => void;
};

export type AnalysisProps = {
  websiteUrl: string;
  onContinue: () => void;
  onBack?: () => void;
};