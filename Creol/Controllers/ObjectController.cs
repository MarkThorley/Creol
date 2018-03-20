using Autodesk.Forge;
using Autodesk.Forge.Model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Web.Http;

namespace Creol.Controllers
{
    public class ObjectController : ApiController
    {
        /// <summary>
        /// Start the delete job for a given bucketKey/objectName
        /// </summary>
        /// <param name="objModel"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/forge/object/jobs")]
        public async Task DeleteObject([FromBody]DeleteObjectModel objModel)
        {
            dynamic oauth = await OAuthController.GetInternalAsync();

            // start the deletion
            var apiInstance = new ObjectsApi();
            var bucketKey = objModel.bucketKey;  // string | URL-encoded bucket key
            var objectName = objModel.objectName;  // string | URL-encoded object name

            try
            {
                apiInstance.DeleteObject(bucketKey, objectName);
            }
            catch (Exception e)
            {
                Debug.Print("Exception when calling ObjectsApi.DeleteObject: " + e.Message);
            }
        }
    }

    /// <summary>
    /// Model for DeleteObject method
    /// </summary>
    public class DeleteObjectModel
        {
            public string bucketKey { get; set; }
            public string objectName { get; set; }
        }
    }
