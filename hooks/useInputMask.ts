import { ChangeEvent } from 'react'

export function useInputMask() {
    const maskCPF = (value: string): string => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d)/, '$1.$2')
            .replace(/(\d{3})(\d{1,2})/, '$1-$2')
            .replace(/(-\d{2})\d+?$/, '$1')
    }

    const maskPhone = (value: string): string => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{2})(\d)/, '($1) $2')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{4})\d+?$/, '$1')
    }

    const maskCEP = (value: string): string => {
        return value
            .replace(/\D/g, '')
            .replace(/(\d{5})(\d)/, '$1-$2')
            .replace(/(-\d{3})\d+?$/, '$1')
    }

    const removeMask = (value: string): string => {
        return value.replace(/\D/g, '')
    }

    const handleCPFChange = (
        e: ChangeEvent<HTMLInputElement>,
        onChange: (value: string) => void
    ) => {
        const maskedValue = maskCPF(e.target.value)
        onChange(maskedValue)
    }

    const handlePhoneChange = (
        e: ChangeEvent<HTMLInputElement>,
        onChange: (value: string) => void
    ) => {
        const maskedValue = maskPhone(e.target.value)
        onChange(maskedValue)
    }

    const handleCEPChange = (
        e: ChangeEvent<HTMLInputElement>,
        onChange: (value: string) => void
    ) => {
        const maskedValue = maskCEP(e.target.value)
        onChange(maskedValue)
    }

    return {
        maskCPF,
        maskPhone,
        maskCEP,
        removeMask,
        handleCPFChange,
        handlePhoneChange,
        handleCEPChange,
    }
}
