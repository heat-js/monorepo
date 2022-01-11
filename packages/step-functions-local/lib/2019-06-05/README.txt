README
======
Step Functions local allows you to run a start an execution on any machine. The local 
version of Step Functions can invoke Lambda functions, both in AWS and running locally. 
You can also coordinate other supported AWS services. 

Release Notes
-------------
Version: 1.0.0 - The initial release of Step Functions local.
Version: 1.0.1 - Fixed an issue with loading the configuration.
Version: 1.0.2 - Replaced generic exception with a specific unsupported exception for an unsupported request.
Version: 1.0.3 - Adding restriction to the length of activity name, state machine name, and execution name (Length should be between 1 and 80).
Version: 1.1.0 - Adding service integrations for Lambda and callback task support for SQS, SNS, Lambda, and ECS.
Version: 1.1.1 - Fixed an issue of GetActivityTask getting suspended due to race condition.
Version: 1.1.2 - Adding support for JSON type for parameters of SQS and SNS.
Version: 1.2.0 - Adding support for resource tagging operations. This release adds the TagResource, UntagResource, and ListTagsForResource APIs and implements tag-on-create functionality for CreateStateMachine and CreateActivity.

Running Step Functions Local
-----------------------------
   
1) Test the download and view version information.

    java -jar StepFunctionsLocal.jar -v
 
    Step Function Local
    Version: 1.0.0
    Build: 2019-01-21

2) (Optional) View a listing of available commands:

  $ java -jar StepFunctionsLocal.jar -v

3) To start Step Functions on your computer, open a command prompt window, navigate 
   to the directory where you extracted StepFunctionsLocal.jar and type the following 
   command:

    java -jar StepFunctionsLocal.jar

4) To access Step Functions running locally, use the --endpoint-url parameter. For 
   example, using the AWS Command Line Interface, you would specify Step Functions 
   commands as:

    aws stepfunctions --endpoint http://localhost:8083 *command*
    
Note

By default Step Functions local uses a fake account and credentials, and the region is set 
to US East (N. Virginia). To use Step Functions local with AWS Lambda or other supported 
services, you must configure your credentials and region.

Documentation
-------------
For an overview of Step Functions local and configuration information, see:
   https://docs.aws.amazon.com/step-functions/latest/dg/sfn-local.html
