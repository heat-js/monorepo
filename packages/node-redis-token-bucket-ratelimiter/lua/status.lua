-- valueKey timestampKey | limit intervalMS nowMS [amount]
local valueKey     = KEYS[1] -- "limit:1:V"
local timestampKey = KEYS[2] -- "limit:1:T"
local limit        = tonumber(ARGV[1])
local intervalMS   = tonumber(ARGV[2])
local amount       = math.max(tonumber(ARGV[3]), 0)

local lastUpdateMS
local prevTokens

-- Use effects replication, not script replication;; this allows us to call 'TIME' which is non-deterministic
redis.replicate_commands()

local time = redis.call('TIME')
local nowMS = math.floor((time[1] * 1000) + (time[2] / 1000))
local initialTokens = redis.call('GET',valueKey)
local initialUpdateMS = false


if initialTokens == false then
   -- If we found no record, we temporarily rewind the clock to refill
   -- via addTokens below
   prevTokens = 0
   lastUpdateMS = nowMS - intervalMS
else
   prevTokens = initialTokens
   initialUpdateMS = redis.call('GET',timestampKey)

   if(initialUpdateMS == false) then -- this is a corruption
      -- we make up a time that would fill this limit via addTokens below
      lastUpdateMS = nowMS - ((prevTokens / limit) * intervalMS)
   else
      lastUpdateMS = initialUpdateMS
   end
end

-- tokens that should have been added by now
-- note math.max in case this ends up negative (clock skew?)
-- now that we call 'TIME' this is less likely to happen
local addTokens = math.max(((nowMS - lastUpdateMS) / intervalMS) * limit, 0)

-- calculated token balance coming into this transaction
local grossTokens = math.min(prevTokens + addTokens, limit)

-- token balance after trying this transaction
local netTokens = grossTokens - amount

local retryDelta = 0

if netTokens < 0 then
	retryDelta = math.ceil((math.abs(netTokens) / limit) * intervalMS)
end

return { grossTokens, retryDelta }
