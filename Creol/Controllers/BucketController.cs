using Autodesk.Forge;
using Autodesk.Forge.Model;
using System;
using System.Collections.Generic;
using System.Diagnostics;
using System.Threading.Tasks;
using System.Web.Http;

namespace Creol.Controllers
{
    public class BucketController : ApiController
    {
        /// <summary>
        /// Start the delete job for a given bucketKey/objectName
        /// </summary>
        /// <param name="buckModel"></param>
        /// <returns></returns>
        [HttpPost]
        [Route("api/forge/bucket/jobs")]
        public async Task DeleteBucket([FromBody]DeleteBucketModel buckModel)
        {
            dynamic oauth = await OAuthController.GetInternalAsync();

            // start the deletion
            var apiInstance = new BucketsApi();
            var bucketKey = buckModel.bucketKey;  // string | URL-encoded bucket key

            try
            {
                apiInstance.DeleteBucket(bucketKey);
                
                }
            catch (Exception e)
            {
                Debug.Print("Exception when calling BucketsApi.DeleteBucket: " + e.Message);
            }
        }
    }

    /// <summary>
    /// Model for DeleteBucket method
    /// </summary>
    public class DeleteBucketModel
    {
        public string bucketKey { get; set; }
    }
}
