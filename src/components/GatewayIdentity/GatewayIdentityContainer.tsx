import react, { useState } from 'react'
import axios from 'axios'
import { useErrors } from 'hooks/useErrors'
import { GatewayIdentity } from './GatewayIdentity'
import { config } from 'config';

type GatewayIdentityContainerProps = {
    identity?: {
        did: string
        publicKey: string
    },
    auth: string 
}

export const GatewayIdentityContainer = ({
    identity,
    auth
}: GatewayIdentityContainerProps) => {
    const errors = useErrors()
    const [isLoading, setIsLoading] = useState(false)
    const [error, setError] = useState('')
    const [did, setDid] = useState(identity?.did ?? '')
    const [publicKey, setPublicKey] = useState(identity?.publicKey ?? '')

    
    const token: string | undefined = auth.split(" ").pop() as string;
    console.log('token', token)

    if(config.authentication.username && config.authentication.password && !token) {
        setError(`Error: ${errors('Authentication Required!')}`)
    }

    const handleSubmit = async (privateKey: string) => {
        setError('')
        setIsLoading(true)
        try {
            const res = await axios.post('/api/config/identity', { privateKey })
            setDid(res.data.ok.did)
            setPublicKey(res.data.ok.publicKey)
        } catch (err) {
            setError(`Error: ${errors(err.response.data.err)}`)
        }
        setIsLoading(false)
    }

    return (
        <GatewayIdentity
            did={did}
            publicKey={publicKey}
            isLoading={isLoading}
            error={error}
            onSubmit={handleSubmit}
        />
    )
}
