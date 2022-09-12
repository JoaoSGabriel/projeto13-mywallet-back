import joi from 'joi';

const spentSchema = joi.object({
    date: joi.date().required(),
    description: joi.string().min(5).max(60).required(),
    value: joi.number().required(),
    type: joi.string().valid('entrada', 'saída')
});

export { spentSchema };