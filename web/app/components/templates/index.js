import Template01 from "./template-01";
import Template02 from "./template-02";
import Template03 from "./template-03";
import Template04 from "./template-04";

/**
 * ✅ Qui “incolli” il motion al template.
 * L’utente NON sceglie motion: sceglie solo il template.
 *
 * motionKey deve corrispondere a una chiave in Brand/motion.json
 * (es: calm, standard, dynamic, editorial)
 */
export const TEMPLATE_LIST = [
  { id: "template-01", label: "Template 01", Component: Template01, motionKey: "standard" },
  { id: "template-02", label: "Template 02", Component: Template02, motionKey: "calm" },
  { id: "template-03", label: "Template 03", Component: Template03, motionKey: "dynamic" },
  { id: "template-04", label: "Template 04", Component: Template04, motionKey: "editorial" },
];

export function getTemplateById(id) {
  return TEMPLATE_LIST.find((t) => t.id === id) || TEMPLATE_LIST[0];
}
