using System;
using System.Collections.Generic;
using System.ComponentModel.DataAnnotations;
using System.Linq;
using System.Text;
using System.Threading.Tasks;
using Edunary.Application.Common.Interfaces;

namespace Edunary.Application.Customers.Validation;
public class CheckEmailExistsAttribute : ValidationAttribute
{
	protected override ValidationResult IsValid(object value, ValidationContext validationContext)
	{
		var identityService = validationContext.GetService(typeof(IIdentityService)) as IIdentityService;

		var objectInfo = validationContext.ObjectInstance.GetType();
		var id = objectInfo.GetProperty("Id")?.GetValue(validationContext.ObjectInstance, null);
		var isExisted = identityService!.CheckUserNameExist((string)value!).Result;
		if (!string.IsNullOrEmpty((string)id) && isExisted)
		{
			var user = identityService!.GetUserById((string)id!).Result;
			if (user != null && user.Email == value?.ToString())
			{
				isExisted = false;
			}
		}
		if (!isExisted)
		{
			return ValidationResult.Success!;
		}
		return new ValidationResult(FormatErrorMessage(validationContext.DisplayName), validationContext.DisplayName.Split('\n'));
	}
}
