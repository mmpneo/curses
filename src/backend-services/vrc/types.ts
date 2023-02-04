export interface IVRCTarget {
  pushFinal(value: string): void;
  pushInterim(value: string): void;
  cancel(): void;
}