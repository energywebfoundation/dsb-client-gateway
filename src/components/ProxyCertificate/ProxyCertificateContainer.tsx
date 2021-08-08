import react, { useState } from 'react'
import axios from 'axios'
import { ProxyCertificate } from './ProxyCertificate'
import { config } from 'config';

type ProxyCertificateContainerProps = {
    certificate?: {
        clientId: string
        tenantId: string
        clientSecret: string
    }
    auth: string 
}

export const ProxyCertificateContainer = ({
    certificate, 
    auth
}: ProxyCertificateContainerProps) => {
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')

    const token: string | undefined= auth.split(" ").pop() as string;
  
    if(config.authentication.username && config.authentication.password && !token) {
        setError(`Error: 'Authentication Required!'`)
    }

    const handleSubmit = async (clientId: string, tenantId: string, clientSecret: string) => {
        setError('')
        setIsLoading(true)
        try {
            await axios.post('/api/config/certificate', {
                clientId,
                tenantId,
                clientSecret
            })
        } catch (err) {
            setError(`Error: ${err.response.data.err}`)
        }
        setIsLoading(false)
    }

    return (
        <ProxyCertificate
            originalClientId={certificate?.clientId ?? ''}
            originalTenantId={certificate?.tenantId ?? ''}
            isLoading={isLoading}
            error={error}
            onSubmit={handleSubmit}
        />
    )
}
