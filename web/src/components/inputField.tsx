import React, { InputHTMLAttributes } from 'react'
import { useField } from 'formik';
import { FormControl, FormLabel, Input, FormErrorMessage } from '@chakra-ui/core';

type inputFieldProps = InputHTMLAttributes<HTMLInputElement> & {
   name: string;
   label: string;
};

// '' = false
// 'error message' = true

export const InputField: React.FC<inputFieldProps> = ({label, size: _, ...props}) => {
   const [field, {error}] = useField(props);
   
   return (
      <FormControl isInvalid={!!error}>
         <FormLabel htmlFor={field.name}>{label}</FormLabel>
         <Input {...field} {...props} id={field.name}/>
         {error ? <FormErrorMessage>{error}</FormErrorMessage>: null}
      </FormControl>
   ); 
}