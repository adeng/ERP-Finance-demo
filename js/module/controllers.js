angular.module('main.controllers', [])

.controller('MainCtrl', function($rootScope, Data, Helper, Reporting, Fetch) {
	$rootScope.module = 'templates/login/login.html';
	$rootScope.loggedIn = false;
	$rootScope.uid = "";
	$rootScope.authorized = false;
	$rootScope.curr = 'overview';

	$rootScope.toDateString = function( date ) {
		return (new Date(date)).toDateString();
	}

	$rootScope.navigate = function(loc) {
		if( !$rootScope.loggedIn && loc != "home" ) {
			return;
		}

		switch(loc) {
			case "home":
				if( $rootScope.loggedIn )
					$rootScope.module = 'templates/nav/home.html';
				else
					$rootScope.module = 'templates/login/login.html';
				$rootScope.curr = 'overview';
				break;

			case "profile":
				$rootScope.module = 'templates/login/profile.html';
				$rootScope.curr = 'profile';
				break;

			case "settings":
				$rootScope.module = 'templates/login/settings.html';
				$rootScope.curr = 'admin';
				break;

			case "posting":
				$rootScope.module = 'templates/posting/postrevenue.html';
				$rootScope.curr = 'revenues';
				break;

			case "trial":
				$rootScope.module = 'templates/reports/trialbalance.html';
				$rootScope.curr = "reports";
				break;

			case "incomestatement":
				$rootScope.module = 'templates/reports/incomestatement.html';
				$rootScope.curr = "reports";
				break;

			case "balancesheet":
				$rootScope.module = 'templates/reports/balancesheet.html';
				$rootScope.curr = "reports";
				break;

			case "reporting":
				$rootScope.module = 'templates/reports/reporting.html';
				$rootScope.curr = "reports";
				break;
		}
	}
})

.controller('SidebarCtrl', function($scope) {

})

.controller('NavCtrl', function($rootScope, $scope, Auth) {
	$scope.logout = function() {
		Auth.logout();
		$rootScope.uid = "";
		$rootScope.loggedIn = false;
		$rootScope.authorized = false;
		$rootScope.navigate('home');
	}
})

.controller('ProfileCtrl', function($scope, $rootScope, Auth) {
	$scope.pass = new Object();
	$scope.email = new Object();

	$scope.change = function() {
		if( $scope.pass.new != $scope.pass.newconf ) {
			alert("The two passwords don't match!");
			return;
		}
		else
			Auth.changePassword( $rootScope.uid, $scope.pass.old, $scope.pass.new );
	}

	$scope.changeEmail = function() {
		if( $scope.email.new != $scope.email.newconf ) {
			alert("The two emails don't match!");
			return;
		}
		else
			Auth.changeEmail( $rootScope.uid, $scope.email.new, $scope.email.pass );
	}
})

.controller('PostRevenueCtrl', function($scope, Data, Helper) {
	$scope.rev = new Object();
	$scope.rev.date = new Date();
	$scope.maxDate = new Date();

	$scope.today = function() {
		$scope.rev.date = new Date();
	}

	Helper.getRevenues().then( function( val ) {
	 	$scope.accounts = val;
	});

	Helper.getAssets().then( function( val ) {
		$scope.assets = val;
	});

	$scope.postRevenue = function() {
		var trans = new Object();
		trans.time = $scope.rev.date.getTime();
		trans.transaction = new Array();

		trans.transaction[0] = new Object();
		trans.transaction[0][$scope.rev.debit] = $scope.rev.amount;

		trans.transaction[1] = new Object();
		trans.transaction[1][$scope.rev.credit] = -$scope.rev.amount;

		Data.createTrans(trans);
	}
})

.controller('ReportingCtrl', function($scope, $rootScope) {

})

.controller('BalanceSheetCtrl', function($scope, $rootScope, Fetch, Helper) {
	$scope.now = new Date().getTime();
	$scope.init = function( time, stamp ) {
		$scope.curAssets = new Array();
		$scope.nonAssets = new Array();
		$scope.curLiabilities = new Array();
		$scope.nonLiabilities = new Array();
		$scope.equity = new Array();
		$scope.totalAssets = 0;
		$scope.totalLiabilities = 0;
		$scope.totalEquity = 0;
		$scope.totalLiabilitiesEquity = 0;

		$scope.curr = stamp;
		Fetch.getSnapshot( time ).then( function(val) {
			$scope.glcodes = new Array();
			$scope.amounts = new Array();
			Fetch.getGLCodes().then( function(codes) {
				$scope.codes = codes;
			});

			for( var key in val )
			{
				for( var gl in val[key] ) {
					if( parseInt( gl[0] ) > 3 || parseInt(val[key][gl]) == 0)
						continue;
					var amount = ( parseInt(gl[0]) > 1 ) ? -1 * parseInt(val[key][gl]) : parseInt(val[key][gl]);
					switch( gl[0] ) {
						// Assets
						case "1":
							if( parseInt( gl.substr(0, 3)) < 104 )
								$scope.curAssets.push({ desc: gl, amount: Helper.accountify(amount) });
							else
								$scope.nonAssets.push({ desc: gl, amount: Helper.accountify(amount) });
							$scope.totalAssets += amount;
							break;

						// Liabilities
						case "2":
							if( parseInt( gl.substr(0, 3)) < 201 )
								$scope.curLiabilities.push({ desc: gl, amount: Helper.accountify(amount) });
							else
								$scope.nonLiabilities.push({ desc: gl, amount: Helper.accountify(amount) });
							$scope.totalLiabilities += amount;
							break;

						// Equity
						case "3":
							$scope.equity.push({ desc: gl, amount: Helper.accountify(amount) });
							$scope.totalEquity += amount;
							break;
					}
				}
			}

			$scope.totalAssets = Helper.accountify($scope.totalAssets);
			$scope.totalLiabilitiesEquity = Helper.accountify($scope.totalLiabilities + $scope.totalEquity);
			$scope.totalLiabilities = Helper.accountify($scope.totalLiabilities);
			$scope.totalEquity = Helper.accountify($scope.totalEquity);
		});
	}

	$scope.init( (new Date()).getTime() );
	$scope.curr = 0;
	Helper.getAllQuarters().then(function(quarters) {
		$scope.quarters = quarters;
	});
})

.controller('IncomeStatementCtrl', function($scope, $rootScope, Fetch, Helper) {
	$scope.now = new Date().getTime();
	$scope.init = function( time, stamp ) {
		$scope.revenues = new Array();
		$scope.expenses = new Array();
		$scope.others = new Array();
		$scope.incomeBeforeTax = 0;
		$scope.tax = 0;

		$scope.curr = stamp;
		Fetch.getSnapshot( time ).then( function(val) {
			$scope.glcodes = new Array();
			$scope.amounts = new Array();
			Fetch.getGLCodes().then( function(codes) {
				$scope.codes = codes;
			});

			for( var key in val )
			{
				for( var gl in val[key] ) {
					if( parseInt( gl[0] ) < 5 || parseInt(val[key][gl]) == 0)
						continue;
					var amount = -1 * parseInt(val[key][gl]);
					$scope.incomeBeforeTax += amount;
					switch( gl[0] ) {
						// Revenues
						case "5":
							if( parseInt( gl.substr(0, 3)) == 500 )
								$scope.revenues.push({ desc: gl, amount: Helper.accountify(amount) });
							else
								$scope.others.push({ desc: gl, amount: Helper.accountify(amount) });
							break;

						// Expenses
						case "6":
							if( parseInt( gl.substr(0, 3)) == 600 )
								$scope.expenses.push({ desc: gl, amount: Helper.accountify(amount) });
							else
								$scope.others.push({ desc: gl, amount: Helper.accountify(amount) });
							break;

						// Gains/Losses
						case "9":
							$scope.others.push({ desc: gl, amount: Helper.accountify(amount) });
							break;
					}
				}
				$scope.tax = 0; // adjust for tax rate later
				$scope.netIncome = Helper.accountify($scope.incomeBeforeTax - $scope.tax);

				// Accountify the rest
				$scope.incomeBeforeTax = Helper.accountify($scope.incomeBeforeTax);
				$scope.tax = Helper.accountify($scope.tax);
			}
		});
	}

	$scope.init( (new Date()).getTime() );
	$scope.curr = 0;
	Helper.getAllQuarters().then(function(quarters) {
		$scope.quarters = quarters;
	});
})

.controller('TrialBalanceCtrl', function($scope, $rootScope, Helper, Reporting, Fetch) {
	$scope.now = new Date().getTime();
	$scope.init = function( time, stamp ) {
		$scope.curr = stamp;
		Fetch.getSnapshot( time ).then( function(val) {
			$scope.glcodes = new Array();
			$scope.amounts = new Array();
			Fetch.getGLCodes().then( function(codes) {
				$scope.codes = codes;
			});

			for( var key in val )
			{
				for( var gl in val[key] ) {
					$scope.glcodes.push(gl);
					if( gl[0] == "2" || gl[0] == "3" || gl[0] == "5" || gl == "9001" )
						$scope.amounts.push(Helper.accountify(-1 * parseInt(val[key][gl])));
					else
						$scope.amounts.push(Helper.accountify(parseInt(val[key][gl])));
				}
			}
		});
	}

	$scope.init( (new Date()).getTime() );
	$scope.curr = 0;
	Helper.getAllQuarters().then(function(quarters) {
		$scope.quarters = quarters;
	});
})

.controller('SettingsCtrl', function($scope, $rootScope, Auth) {
	$scope.create = new Object();

	$scope.createUser = function() {
		if( $scope.create.new != $scope.create.newconf ) {
			alert("The two passwords don't match!");
			return;
		}
		else
			Auth.createUser( $scope.create.email, $scope.create.new );
	}
})

.controller('LoginCtrl', function($scope, $rootScope, $modal, Auth) {
	$scope.login = new Object();

	$scope.loginfailure = false;

	var authUsers = ["albert.deng.927@gmail.com", "summerwang95@gmail.com"];

	$scope.auth = function() { /*
		var request = Auth.login( $scope.login.email, $scope.login.password );
		request.then( function(val) {
			if( val == "FAILURE" ) {
				alert("Invalid username and/or password!");
			}
			else {
				$rootScope.loggedIn = true;
				$rootScope.uid = val.password.email;
				$rootScope.authorized = ( authUsers.indexOf($rootScope.uid) != -1 );
				$rootScope.navigate('home');
			}
		}); */

		$rootScope.loggedIn = true;
		$rootScope.navigate('home');
	}

	$scope.reset = function () {
			var modalInstance = $modal.open({
				animation: $scope.animationsEnabled,
				templateUrl: 'resetPassword.html',
				controller: 'ResetPasswordCtrl',
				size: 'sm',
				resolve: {
					items: function () {
						return $scope.items;
					}
				}
			});

		modalInstance.result.then(function (val) {
			Auth.resetPassword(val);
		});
	}

})

.controller('ResetPasswordCtrl', function($scope, $modalInstance) {
	$scope.resetEmail;

	$scope.ok = function() {
		$modalInstance.close($scope.resetEmail);
	}

	$scope.cancel = function () {
		$modalInstance.dismiss('cancel');
	};
});
