import { z } from 'zod';

try {
  const schema = z.object({
    agreeToTerms: z.literal(true, {
      message: 'Need consent',
    }),
  });
  console.log('Schema created successfully');
  schema.parse({ agreeToTerms: false });
} catch (e) {
  console.log('Error:', e);
}
