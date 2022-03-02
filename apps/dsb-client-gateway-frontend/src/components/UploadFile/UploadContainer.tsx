import { useState } from 'react'
import { Upload } from './Upload'
import axios from 'axios'
import swal from '@sweetalert/with-react'
import { Channel } from '../../utils'

type UploadContainerProps = {
  auth?: string
  channels: Channel[] | undefined
}

export const UploadContainer = ({ auth, channels }: UploadContainerProps) => {
  const [isLoading, setIsLoading] = useState(false)

  const handleUpload = async (file: File, fqcn: string, topic: string) => {
    setIsLoading(true)
    const formData = new FormData()
    formData.append('file', file)

    try {
      const res = await axios.post(
        `/api/v1/upload?fqcn=${fqcn}&topic=${topic}`,
        formData,
        {
          headers: {
            Authorization: auth ? `Bearer ${auth}` : undefined,
            'content-type': 'multipart/form-data'
          }
        }
      )
      const { id, transactionId } = res.data
      swal(`Success: ${id}`, `File uploaded with transaction ID\n${transactionId}`, 'success')
    } catch (err) {
      if (axios.isAxiosError(err)) {
        swal('Error', err.response?.data?.err?.reason, 'error')
      } else {
        swal('Error', `Could not set identity: ${err}`, 'error')
      }
      setIsLoading(false)
    }
  }

  return <Upload channels={channels} onUpload={handleUpload} />
}
