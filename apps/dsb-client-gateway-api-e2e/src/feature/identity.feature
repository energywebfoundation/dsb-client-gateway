Feature: Identity
  
  ## ID-001
  Scenario Outline: Receives identity
    Given The system has no identity set
    When The <PrivateKey_ID> is submitted to the system
    Then I should get in POST response <Address>
    Then The <UserRole> has its enrolment status equals to <EnrolmentStatus> for the application <Application> and role is SYNCED
    Then The signature key and public RSA key should exists in DID document for <Address>
    ## I prefer the use of the third voice, since it allows us to also name the role of the 
    ## person involved.
    
    ## I think we should focus only on the responses. Because for example, if you're going to
    ## talk about DID Document, then when you implement this step, you should get a way to obtain
    ## that DID document.
    Examples:
    | PrivateKey_ID | Address | UserRole | EnrolmentStatus | Application |
    | s2whsu7jjyj4y2ezph7swiyy7a | 0x552761011ea5b332605Bc1Cc2020A4a4f8C738CD | user.roles | SYNCED | ddhub.apps.energyweb.iam.ewc|
  
  ## ID-002
  Scenario Outline: No private key
    Given The system has no identity set
    When The <PrivateKey_ID> is submitted to the system
    ## We should use the same step than in scenario 001 so we can reuse. In this case we 
    ## add an null or empty value for <PrivateKey_ID>
    Then I should get no private key error

    Examples:
    | PrivateKey_ID |
    | <<null>>      |
  
  ## ID-003
  Scenario Outline: Invalid private key
  ## Question: This includes the "Insuficient Funds" scenario??
    Given The system has no identity set
    When The <PrivateKey_ID> is submitted to the system
    ## We should use the same step than in scenario 001 so we can reuse.
    Then I should get validation error

    Examples:
    | PrivateKey_ID |
    | invalid       |

  ## ID-004
  Scenario Outline: Retrieve current Identity
    Given 
    When 
    Then 

  ## ID-005
  Scenario Outline: Reset current Identity
    Given 
    When 
    Then 

