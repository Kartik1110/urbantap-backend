import { z } from "zod";

export const BrokerTypeEnum = z.enum(["Off_plan", "Ready_to_move", "Both"]);


export const updateBrokerDataSchema = z.object({
  name: z.string().optional(),
  email: z.string().email().optional(),
  info: z.string().optional(),
  y_o_e: z.number().int().optional(), 
  languages: z.array(z.string()).optional(),
  is_certified: z.boolean().optional(),
  profile_pic: z.string().optional(),
  country_code: z.string().optional(),
  w_number: z.string().optional(),
  ig_link: z.string().optional(),
  linkedin_link: z.string().optional(),
  designation: z.string().optional(), 
  company_id: z.string().uuid().optional(),
  user_id: z.string().uuid().optional(), 
  type: BrokerTypeEnum.optional(), 
  brokerageId: z.string().uuid().optional(),
  developerId: z.string().uuid().optional(), 
});


export const bulkInsertBrokersSchema = z.object({
  brokers: z
    .array(
      z.object({
        name: z.string(),
        email: z.string().email(),
        info: z.string(),
        y_o_e: z.number().int(), 
        languages: z.array(z.string()),
        is_certified: z.boolean(), 
        profile_pic: z.string(), 
        w_number: z.string(),
        country_code: z.string().optional(),
        ig_link: z.string().optional(),
        linkedin_link: z.string().optional(),
        designation: z.string().optional(),
        company_id: z.string().uuid().optional(),
        user_id: z.string().uuid().optional(),
        type: BrokerTypeEnum.optional(), 
        brokerageId: z.string().uuid().optional(),
        developerId: z.string().uuid().optional(),
      })
    )
    .min(1),
});
