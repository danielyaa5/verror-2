<!--
    This Source Code Form is subject to the terms of the Mozilla Public
    License, v. 2.0. If a copy of the MPL was not distributed with this
    file, You can obtain one at http://mozilla.org/MPL/2.0/.
-->

<!--
    Copyright (c) 2014, Joyent, Inc.
-->

# catest: simple test runner

## Quick start by example

catest ("see-ay-test") is a simple test runner.  It just runs a bunch of
executable programs, saves the output of the ones that failed, and prints
summary output.

This repo contains some examples.  You can run them all with:

    $ ./catest examples/tst.*.sh

This outputs:

    $ ./catest examples/*.sh
    Configuration:
        SRC:                         /Users/dap
        Output directory:            /var/tmp/catest.31947
        Temp directory:              /var/tmp/catest.31947_tmpfiles
        Keep successful test output: false
        Found 3 test(s) to run
    
    ===================================================
    
    Executing test work/catest/examples/tst.success.sh ... success.
    Executing test work/catest/examples/tst.badstatus.sh ... FAILED.
    >>> failure details in /var/tmp/catest.31947/failure.0
    
    Executing test work/catest/examples/tst.badoutput.sh ... FAILED.
    >>> failure details in /var/tmp/catest.31947/failure.1
    
    
    ===================================================
    
    Results:
    	Tests passed:	 1/ 3
    	Tests failed:	 2/ 3
    
    ===================================================
    Cleaning up output from successful tests ... done.

To investigate a failure, "cd" to the failure's directory and start with the
README:

    $ cd /var/tmp/catest.31947/failure.0
    $ cat README 
    /Users/dap/work/catest/examples/tst.badstatus.sh failed: test returned 1

The directory also includes a copy of the test:

    $ ls -l
    total 32
    -rw-r--r--  1 dap  wheel  14 Dec  5 17:19 31947.err
    -rw-r--r--  1 dap  wheel  14 Dec  5 17:19 31947.out
    -rw-r--r--  1 dap  wheel  73 Dec  5 17:19 README
    -rw-r--r--  1 dap  wheel  65 Dec  5 17:19 tst.badstatus.sh

    $ cat tst.badstatus.sh 
    #!/bin/bash
    
    echo "sample stdout"
    echo "sample stderr" >&2
    false

and the stderr and stdout for the test:

    $ cat 31947.err 
    sample stderr

    $ cat 31947.out 
    sample stdout

This test failed because it exited with a non-zero status.  Tests can also fail
because their output didn't match the expected output.  That's failure.1 from
the example above:

    $ cd /var/tmp/catest.31947/failure.1
    $ cat README 
    /Users/dap/work/catest/examples/tst.badoutput.sh failed: stdout mismatch

You can diff what's expected from what was output:

    $ diff tst.badoutput.sh.out 31947.out 
    1c1
    < goodbye
    ---
    > hello

That's pretty much it.


## Test files

catest knows almost nothing about specific languages or test frameworks.  Tests
are just executable programs.  In most cases, a test succeeds if it exits
successfully and it fails otherwise.  You can also specify the expected stdout
of the test in a file with the same name as the test plus a ".out" suffix, in
which case the test will also fail if the actual output does not match the
expected output.

A nice thing about this approach is while you typically run a suite of tests
under catest, it's also completely trivial to run each test individually, under
whatever kind of debugger you need, without catest at all.

catest currently only supports bash (.sh) and Node.js (.js) tests, but this is
easy to extend because it only uses the extension to determine what interpreter
to run.  (Even that could be avoided by having catest just execute the file.
It doesn't do this today for historical reasons.)


**What about common setup/teardown tasks for each test?** This is typically done
by putting common code into a common source file and then invoking that from
each of your test programs.  On the plus side, catest is kept simple, and test
code is explicit.


## Test output

catest prints summary output to stdout.  TAP output can be emitted with "-t".

Per-test output is placed in a new temporary directory.  By default, this is a
new directory in /var/tmp, but you can override this with "-o".

Within the output directory will be a directory for each failed test which
includes a README describing why the test failed (e.g., exited non-zero), a
copy of the test file itself, the actual stdout and stderr of the test, and the
expected stdout of the test (if specified).


## History

This basic approach has been done by lots of tools, and notably
[dtest](https://github.com/joyent/illumos-joyent/blob/master/usr/src/cmd/dtrace/test/cmd/scripts/dtest.pl).
This version was originally written for Joyent's [Cloud
Analytics](https://github.com/joyent/sdc-cloud-analytics) service.  It's also
used by [Marlin](https://github.com/joyent/manta-marlin) and several Node
modules.
