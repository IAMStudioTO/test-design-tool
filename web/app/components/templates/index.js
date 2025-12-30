import Template01 from "./template-01";
import Template02 from "./template-02";
import Template03 from "./template-03";
import Template04 from "./template-04";

export const TEMPLATE_LIST = [
  { id: "template-01", label: "Template 01", Component: Template01 },
  { id: "template-02", label: "Template 02", Component: Template02 },
  { id: "template-03", label: "Template 03", Component: Template03 },
  { id: "template-04", label: "Template 04", Component: Template04 },
];

export function getTemplateById(id) {
  return TEMPLATE_LIST.find((t) => t.id === id) || TEMPLATE_LIST[0];
}
