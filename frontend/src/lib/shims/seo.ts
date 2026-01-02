export const SEO = {
  // Minimal shim: render nothing for server-side SEO placeholder
  Tags: (props: any) => null,
};

export async function loadSEOTagsServiceConfig(_: any) {
  // Return a minimal SEO config placeholder
  return {
    title: _.itemData?.pageName ?? 'Intervue.ai',
    description: 'Intervue.ai',
  };
}
