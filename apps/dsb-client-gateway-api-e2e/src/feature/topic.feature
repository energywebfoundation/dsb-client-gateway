Feature: Topic Management
  
  ## TO-001 (Endpoint POST /api/v2/topics)
  Scenario Outline: Create a topic
  Given the system has a valid identity set
  And the <UserRole> has its enrolment status equals to <EnrolmentStatus> for the application <Application>
  And there is no topic with the name <name>
  When the user submit <schemaType>, <schema>, <version>, <owner>, <tags> to create the <name> topic
  Then the response status is equals to 201
  And a new topic is registered in storage with the name <name>

  Examples:
  | UserRole           | EnrolmentStatus | Application                  | name  |  schemaType  | schema   | version | owner   |  tags    |  
  | topiccreator.roles | SYNCED          | ddhub.apps.energyweb.iam.ewc |       |              |          |         |         |          |
 

 ## TO-002 (Endpoint GET /api/v2/topics/search)
  Scenario Outline: Searching topics
  Given the system has a valid identity set
  And the <UserRole> has its enrolment status equals to <EnrolmentStatus> for the application <Application>
  And the storage contains the topic names <topicNameList>
  When the user submit a topic search with <keyword>, <limit>, <page>
  Then the response status is equals to 200
  And the response body contains the topic names <topicNameResponse>

  Examples:
  | UserRole           | EnrolmentStatus | Application                  | keyword | limit | page | topicNameList              | topicNameResponse |
  | topiccreator.roles | SYNCED          | ddhub.apps.energyweb.iam.ewc | "edge"  | 5     | 1    | edge01, edge02, envelope01 | edge01, edge02    |

 ## TO-003 (Endpoint GET /api/v2/topics)
  Scenario Outline: Getting topics
  Given 
  When 
  Then 

 ## TO-004 (Endpoint GET /api/v2/topics/{id}/versions)
  Scenario Outline: Getting all topic's versions
  Given 
  When 
  Then 

 ## TO-005 (Endpoint GET /api/v2/topics/{id}/versions/{versionNumber})
  Scenario Outline: Getting a specific topic's version
  Given 
  When 
  Then 

## TO-006 (Endpoint PUT /api/v2/topics/{id}/versions/{versionNumber})
  Scenario Outline: Update a topic schema
  Given 
  When 
  Then 

## TO-007 (Endpoint PUT /api/v2/topics/{id})
  Scenario Outline: Update topic's metadata
  Given 
  When 
  Then 

## TO-008 (Endpoint DELETE /api/v2/topics/{id})
  Scenario Outline: Delete a topic
  Given 
  When 
  Then 

## TO-009 (Endpoint DELETE /api/v2/topics/{id}/versions/{version})
  Scenario Outline: Delete a topic's version
  Given 
  When 
  Then 
