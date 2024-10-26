export type TagSupport = SupportsTags | NoTagSupport;

type SupportsTags = {
  supportsTags: true;
  maxTags?: number;
  minTags?: number;
  maxTagLength?: number;
};

type NoTagSupport = {
  supportsTags: false;
};

export const UnlimitedTags = () => ({
  supportsTags: true,
  maxTags: Infinity,
  minTags: 0,
  maxTagLength: Infinity,
});
