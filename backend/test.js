import { processData } from "./src/services/bfhlService.js";

const cases = [
  { label: "Ex1 Basic tree",             input: ["A->B","A->C","B->D"] },
  { label: "Ex2 Duplicates + invalids",  input: ["A->B","A->B","A->C","X->X","bad","1->2"] },
  { label: "Ex3 Multi-parent",           input: ["A->B","C->B"] },
  { label: "Ex4 Two independent trees",  input: ["A->B","C->D","C->E"] },
  { label: "Ex5 Pure cycle",             input: ["A->B","B->C","C->A"] },
  { label: "Ex6 Cycle + external root",  input: ["Z->A","A->B","B->A"] },
  { label: "Ex7 Mixed tree + cycle",     input: ["A->B","B->C","C->B","D->E"] },
];

cases.forEach(c => {
  console.log(`\n${"=".repeat(50)}`);
  console.log(`${c.label}`);
  console.log("=".repeat(50));
  console.log(JSON.stringify(processData(c.input), null, 2));
});
