import { GoogleGenerativeAI } from '@google/generative-ai'

const genAI = new GoogleGenerativeAI(import.meta.env.VITE_GEMINI_API_KEY)

const DOCUMENT_TEMPLATES = {
  leave_application: 'Leave Application Letter',
  cover_letter: 'Cover Letter / Job Application',
  declaration_form: 'Self-Declaration Form',
  authorization_letter: 'Authorization Letter',
  objection_letter: 'Objection / Complaint Letter',
  noc: 'No Objection Certificate (NOC)',
  academic_application: 'Academic Application (College/University)',
  bonafide_request: 'Bonafide Certificate Request',
  experience_letter: 'Experience Letter Request',
  affidavit: 'Affidavit / Undertaking',
  rent_agreement_request: 'Rent Agreement Request Letter',
  custom: 'Custom Document',
}

export const TEMPLATE_LIST = Object.entries(DOCUMENT_TEMPLATES).map(([key, label]) => ({
  key, label,
}))

export const generateDocument = async (templateKey, userDetails) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })
  const templateName = DOCUMENT_TEMPLATES[templateKey] || 'Document'

  const prompt = `
You are a professional document writer. Generate a formal, complete, and ready-to-print ${templateName} in English.

User Details:
${Object.entries(userDetails).map(([k, v]) => `- ${k}: ${v}`).join('\n')}

Requirements:
1. Use proper formal language and formatting
2. Include all standard sections for this document type
3. Use [SIGNATURE] placeholder where signature should go
4. Use [DATE] if not provided
5. Use [SEAL/STAMP] if a stamp is typically required
6. Make it comprehensive and professional
7. Format with clear paragraphs and proper structure
8. Return ONLY the document text, no extra commentary

Generate the complete ${templateName} now:
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}

export const improveDocument = async (documentText, instruction) => {
  const model = genAI.getGenerativeModel({ model: 'gemini-1.5-flash' })

  const prompt = `
You are a professional document editor. Improve the following document based on the instruction provided.

Original Document:
${documentText}

Instruction: ${instruction}

Return ONLY the improved document text, no extra commentary.
`

  const result = await model.generateContent(prompt)
  const response = await result.response
  return response.text()
}
