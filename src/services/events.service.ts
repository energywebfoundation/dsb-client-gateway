import { EventEmitter } from 'events'
import { ClaimEventType, IClaimIssuance } from 'iam-client-lib'
import { connect, JSONCodec } from 'nats.ws'
import { w3cwebsocket } from 'websocket'
import { config } from '../config'
import { EnrolmentState, RoleState, USER_ROLE } from '../utils'
import { isApproved } from './identity.service'
import { writeEnrolment } from './storage.service'
import { IamService } from './iam.service'

// shim websocket for nats.ws
globalThis.WebSocket = w3cwebsocket as any

export const events = new EventEmitter()

export const NATS_EXCHANGE_TOPIC = 'claim-exchange' // pulled directly from IAM CACHE Server

events.on('await_approval', async (iam: IamService) => {
  const state: EnrolmentState = {
    approved: false,
    waiting: true,
    roles: {
      user: RoleState.AWAITING_APPROVAL
      // messagebroker: RoleState.AWAITING_APPROVAL
    }
  }

  console.log('Connecting to', config.iam.eventServerUrl)
  const nc = await connect({ servers: `wss://${config.iam.eventServerUrl}` })
  console.log('Connected to identity events server')

  const did = iam.getDIDAddress()

  const topic = `${ClaimEventType.ISSUE_CREDENTIAL}.${NATS_EXCHANGE_TOPIC}.${did}.${config.iam.natsEnvironmentName}`
  console.log('Listening for role approvals on', topic)

  const jc = JSONCodec<IClaimIssuance>()

  // 1h timeout - needs to be restarted (see catch block)
  const sub = nc.subscribe(topic)

  try {
    for await (const m of sub) {
      const claim = jc.decode(m.data)
      const count = sub.getProcessed()
      console.log(`[${count}] Received identity event: ${JSON.stringify(claim, null, 2)}`)
      if (claim.requester !== did) {
        continue
      }
      if (claim.issuedToken) {
        console.log(`[${count}] Received claim has been issued`)

        const decodedToken = await iam.decodeJWTToken(claim.issuedToken)

        if (decodedToken.claimData.claimType === USER_ROLE) {
          console.log(`[${count}] Received issued claim is ${USER_ROLE}`)
          await iam.publishPublicClaim(claim.issuedToken)
          console.log(`[${count}] Synced ${USER_ROLE} claim to DID Document`)
          state.roles.user = RoleState.APPROVED
        }
        // if (config.dsb.controllable && decodedToken.claimData.claimType === MESSAGEBROKER_ROLE) {
        //   console.log(`[${count}] Received issued claim is ${MESSAGEBROKER_ROLE}`)
        //   await iam.publishPublicClaim({ token: claim.issuedToken })
        //   console.log(`[${count}] Synced ${MESSAGEBROKER_ROLE} claim to DID Document`)
        //   state.roles.messagebroker = RoleState.APPROVED
        // }
      }
      if (state.roles.user === RoleState.APPROVED) {
        // if (config.dsb.controllable && state.roles.messagebroker !== RoleState.APPROVED) {
        //   // wait for messagebroker approval
        //   continue
        // }
        if (sub) {
          console.log('All roles have been approved and synced to DID Document')
          state.approved = isApproved(state)
          state.waiting = false
          await writeEnrolment({ state, did: claim.requester })
          // events.emit('approved')
          await nc.drain()
        }
      }
    }
  } catch (err) {
    // restart subscription
    console.log('Got subscription error. Restarting...')
    events.emit('await_approval', iam)
  }
})
