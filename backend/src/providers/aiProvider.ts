export type AiGenerateInput = {
  message: string;
  patientContext?: {
    name: string;
    medicalNotes?: string | null;
  };
};

export interface AiProvider {
  generate(input: AiGenerateInput): Promise<string>;
}
